import 'dart:convert';
import 'package:english_conversation_app/domain/entities/correction_result.dart';

/// Marqueur que le LLM doit ajouter en fin de reponse quand l'utilisateur
/// a fait une faute (voir [buildSystemPrompt] dans level.dart).
const String kCorrectionMarker = '@@CORRECTION@@';

/// Categories d'erreur reconnues (alignees sur CorrectionResult.category).
const Set<String> kCorrectionCategories = {
  'article',
  'preposition',
  'tense',
  'spelling',
  'word_order',
  'other',
};

/// Resultat du decodage d'une reponse LLM pouvant contenir la balise de
/// correction en fin de message.
class ParsedReply {
  /// Texte a afficher (balise retiree).
  final String content;

  /// Correction extraite (null si absente ou illisible).
  final CorrectionResult? correction;

  /// true si la balise etait presente (memee si le JSON etait casse).
  final bool hasTrailer;

  const ParsedReply(this.content, this.correction, {this.hasTrailer = false});
}

/// Extrait la balise de correction d'une reponse complete du tuteur.
///
/// La balise attendue est la DERNIERE occurrence de [kCorrectionMarker],
/// suivie d'un objet JSON. On est tolerant aux fences markdown (\`\`\`json)
/// et aux espaces. S'il n'y a pas de balise, [ParsedReply.content] vaut
/// exactement le texte d'entree et [ParsedReply.correction] vaut null.
ParsedReply extractCorrectionTrailer(String full) {
  final idx = full.lastIndexOf(kCorrectionMarker);
  if (idx == -1) {
    return ParsedReply(full, null);
  }

  final content = full.substring(0, idx).trim();
  final tail = full.substring(idx + kCorrectionMarker.length);

  CorrectionResult? correction;
  final start = tail.indexOf('{');
  final end = tail.lastIndexOf('}');
  if (start != -1 && end > start) {
    try {
      final json = jsonDecode(tail.substring(start, end + 1));
      if (json is Map) {
        var category = (json['category'] as String?)?.trim();
        if (category != null && !kCorrectionCategories.contains(category)) {
          category = 'other';
        }
        final corrected = (json['corrected'] as String?)?.trim();
        final explanation = (json['explanation'] as String?)?.trim();
        if (corrected != null && corrected.isNotEmpty) {
          correction = CorrectionResult(
            corrected: corrected,
            explanation:
                (explanation == null || explanation.isEmpty) ? null : explanation,
            category: category ?? 'other',
          );
        }
      }
    } catch (_) {
      // JSON casse : on retire quand meme la balise de l'affichage.
      correction = null;
    }
  }

  return ParsedReply(content, correction, hasTrailer: true);
}
