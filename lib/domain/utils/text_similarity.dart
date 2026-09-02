import 'dart:math';

/// Normalise une phrase pour comparaison : minuscules, ponctuation retiree,
/// espaces compacts.
String normalizeText(String s) => s
    .toLowerCase()
    .replaceAll(RegExp(r"[^a-z0-9' ]"), '')
    .replaceAll(RegExp(r'\s+'), ' ')
    .trim();

/// Distance de Levenshtein entre deux chaines.
int levenshteinDistance(String a, String b) {
  final m = a.length, n = b.length;
  if (m == 0) return n;
  if (n == 0) return m;
  var prev = List<int>.generate(n + 1, (i) => i);
  var curr = List<int>.filled(n + 1, 0);
  for (var i = 1; i <= m; i++) {
    curr[0] = i;
    for (var j = 1; j <= n; j++) {
      final cost = a[i - 1] == b[j - 1] ? 0 : 1;
      curr[j] = [
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost,
      ].reduce(min);
    }
    final tmp = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[n];
}

/// Similarite entre 0.0 et 1.0 (1.0 = identiques).
double stringSimilarity(String a, String b) {
  if (a == b) return 1.0;
  final maxLen = max(a.length, b.length);
  if (maxLen == 0) return 1.0;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

/// Reponse d'exercice acceptable ? Egalite apres normalisation, ou
/// similarite >= 0.85 (tolere une petite faute de frappe).
bool isAnswerCloseEnough(String given, String expected) {
  final g = normalizeText(given);
  final e = normalizeText(expected);
  if (g.isEmpty || e.isEmpty) return false;
  if (g == e) return true;
  return stringSimilarity(g, e) >= 0.85;
}
