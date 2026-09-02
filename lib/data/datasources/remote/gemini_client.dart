import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:english_conversation_app/domain/entities/conversation_message.dart';
import 'package:english_conversation_app/data/datasources/remote/llm_client.dart';

/// Client Google AI Studio (Gemini).
class GeminiClient implements LlmClient {
  final String apiKey;
  final String baseUrl;
  final String model;

  GeminiClient({
    required this.apiKey,
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta',
    this.model = 'gemini-2.0-flash',
  });

  @override
  Stream<String> streamChat({
    required ConversationMessage systemPrompt,
    required List<ConversationMessage> history,
    required ConversationMessage userMessage,
  }) async* {
    final parts = [systemPrompt, ...history, userMessage];
    final contents = parts
        .map((m) => {
              'role': m.role == MessageRole.user ? 'user' : 'model',
              'parts': [
                {'text': m.content}
              ]
            })
        .toList();

    final uri = Uri.parse(
        '$baseUrl/models/$model:streamGenerateContent?alt=sse&key=$apiKey');
    final request = http.Request('POST', uri)
      ..headers['Content-Type'] = 'application/json'
      ..body = jsonEncode({'contents': contents});

    final response = await request.send();
    if (response.statusCode != 200) {
      final body = await response.stream.bytesToString();
      throw Exception('Gemini error ${response.statusCode}: $body');
    }
    await for (final line
        in response.stream.transform(utf8.decoder).transform(const LineSplitter())) {
      if (!line.startsWith('data:')) continue;
      final data = line.substring(5).trim();
      if (data.isEmpty) continue;
      final json = jsonDecode(data) as Map<String, dynamic>;
      final text = json['candidates']?[0]?['content']?['parts']?[0]?['text'];
      if (text is String) yield text;
    }
  }

}
