import 'dart:async';
import 'dart:io';
import 'dart:isolate';

import 'package:audioplayers/audioplayers.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:sherpa_onnx/sherpa_onnx.dart' as sherpa;

import 'package:english_conversation_app/data/tts/tts_service.dart';

/// Moteur TTS neuronal 100 % offline (sherpa-onnx + modele Piper VITS).
///
/// - Voix naturelle (intonation) en anglais americain, aucune cle API.
/// - Le modele (~63 Mo) est telecharge une seule fois puis extrait localement.
/// - La synthese tourne dans un isolate dedie pour ne pas geler l'UI.
class SherpaTtsService implements TtsService {
  SherpaTtsService();

  static const String modelDirName = 'vits-piper-en_US-amy-medium';
  static const String modelUrl =
      'https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/'
      '$modelDirName.tar.bz2';

  /// Desktop uniquement pour la V1 (extraction via tar systeme).
  static bool get platformSupported =>
      Platform.isWindows || Platform.isLinux || Platform.isMacOS;

  // --- Worker isolate (synthese hors UI thread) ---
  ReceivePort? _mainPort;
  SendPort? _workerPort;
  Completer<SendPort>? _portReady;
  Completer<void>? _initAck;
  Completer<String>? _speakAck;
  bool _booted = false;
  bool _bootFailed = false;
  Future<void> _queue = Future.value();

  final AudioPlayer _player = AudioPlayer();
  String? _rootDir;

  Future<String> _root() async {
    if (_rootDir != null) return _rootDir!;
    final support = await getApplicationSupportDirectory();
    _rootDir =
        '${support.path}${Platform.pathSeparator}tts_neural';
    return _rootDir!;
  }

  Future<String> _modelDir() async =>
      '${await _root()}${Platform.pathSeparator}$modelDirName';

  Future<bool> isModelInstalled() async {
    final dir = await _modelDir();
    final sep = Platform.pathSeparator;
    final modelOk =
        await File('$dir${sep}en_US-amy-medium.onnx').exists();
    final tokensOk = await File('$dir${sep}tokens.txt').exists();
    final espeakOk =
        await Directory('$dir${sep}espeak-ng-data').exists();
    return modelOk && tokensOk && espeakOk;
  }

  /// Telecharge le modele avec progression (0.0 -> 1.0) puis l'extrait.
  Future<void> downloadModel({void Function(double progress)? onProgress}) async {
    final root = await _root();
    await Directory(root).create(recursive: true);
    final archivePath = '$root${Platform.pathSeparator}$modelDirName.tar.bz2';

    final request = http.Request('GET', Uri.parse(modelUrl));
    final response = await http.Client().send(request);
    if (response.statusCode != 200) {
      throw Exception('Telechargement du modele: HTTP ${response.statusCode}');
    }
    final total = response.contentLength ?? 0;
    var received = 0;
    final sink = File(archivePath).openWrite();
    try {
      await for (final chunk in response.stream) {
        received += chunk.length;
        sink.add(chunk);
        if (total > 0) onProgress?.call(received / total);
      }
    } finally {
      await sink.flush();
      await sink.close();
    }

    // Extraction (bsdtar/GNU tar autodetectent le format bzip2).
    final result = await Process.run('tar', ['-xf', archivePath, '-C', root]);
    if (result.exitCode != 0) {
      throw Exception(
          "Extraction 'tar' echouee (code ${result.exitCode}): ${result.stderr}");
    }
    final f = File(archivePath);
    if (await f.exists()) await f.delete();

    if (!await isModelInstalled()) {
      throw Exception('Modele incomplet apres extraction.');
    }
  }

  // ------------------------------------------------------------------
  // Worker isolate
  // ------------------------------------------------------------------

  Future<bool> _ensureWorker() async {
    if (_booted) return true;
    if (_bootFailed) return false;
    try {
      final dir = await _modelDir();
      if (!await isModelInstalled()) return false;

      _mainPort = ReceivePort();
      _portReady = Completer<SendPort>();
      await Isolate.spawn(_sherpaWorkerMain, _mainPort!.sendPort);
      _mainPort!.listen(_onWorkerMessage);
      _workerPort = await _portReady!.future;

      _initAck = Completer<void>();
      _workerPort!.send({'cmd': 'init', 'modelDir': dir});
      await _initAck!.future.timeout(const Duration(minutes: 2));
      _booted = true;
      return true;
    } catch (_) {
      _bootFailed = true;
      return false;
    }
  }

  void _onWorkerMessage(dynamic message) {
    final m = message as Map;
    switch (m['evt'] as String) {
      case 'port':
        _portReady?.complete(m['port'] as SendPort);
      case 'ready':
        _initAck?.complete();
      case 'done':
        _speakAck?.complete(m['path'] as String);
      case 'error':
        final e = Exception(m['message']);
        if (_initAck != null && !_initAck!.isCompleted) {
          _initAck!.completeError(e);
        }
        if (_speakAck != null && !_speakAck!.isCompleted) {
          _speakAck!.completeError(e);
        }
    }
  }

  @override
  Future<bool> isReady() async =>
      platformSupported && await isModelInstalled();

  @override
  Future<void> speak(String text, {double speed = 1.0}) async {
    // Serialise les lectures ; chaque tache attend la precedente.
    final task = _queue.then((_) => _speakNow(text, speed));
    _queue = task.catchError((_) {});
    return task;
  }

  Future<void> _speakNow(String text, double speed) async {
    if (!await _ensureWorker()) {
      throw Exception('Modele TTS neuronal non disponible.');
    }
    final tmp = await getTemporaryDirectory();
    final wavPath =
        '${tmp.path}${Platform.pathSeparator}tts_neural_out.wav';

    _speakAck = Completer<String>();
    _workerPort!.send({
      'cmd': 'speak',
      'text': text,
      'speed': speed,
      'wav': wavPath,
    });
    final path = await _speakAck!.future.timeout(const Duration(minutes: 3));
    await _player.play(DeviceFileSource(path));
  }

  @override
  Future<void> stop() async {
    await _player.stop();
  }

  /// Point d'entree du worker (top-level obligatoire pour Isolate.spawn).
  static void _sherpaWorkerMain(SendPort mainPort) {
    final inbox = ReceivePort();
    mainPort.send({'evt': 'port', 'port': inbox.sendPort});

    sherpa.OfflineTts? tts;
    inbox.listen((message) {
      final m = message as Map;
      try {
        switch (m['cmd'] as String) {
          case 'init':
            final dir = m['modelDir'] as String;
            final sep = Platform.pathSeparator;
            final vits = sherpa.OfflineTtsVitsModelConfig(
              model: '$dir${sep}en_US-amy-medium.onnx',
              tokens: '$dir${sep}tokens.txt',
              dataDir: '$dir${sep}espeak-ng-data',
            );
            tts = sherpa.OfflineTts(
              sherpa.OfflineTtsConfig(
                model: sherpa.OfflineTtsModelConfig(
                  vits: vits,
                  numThreads: 2,
                  debug: false,
                ),
              ),
            );
            mainPort.send({'evt': 'ready'});
          case 'speak':
            final audio = tts!.generate(
              text: m['text'] as String,
              sid: 0,
              speed: (m['speed'] as num).toDouble(),
            );
            sherpa.writeWave(
              filename: m['wav'] as String,
              samples: audio.samples,
              sampleRate: audio.sampleRate,
            );
            mainPort.send({'evt': 'done', 'path': m['wav']});
        }
      } catch (e) {
        mainPort.send({'evt': 'error', 'message': e.toString()});
      }
    });
  }
}
