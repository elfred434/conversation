import 'package:flutter_test/flutter_test.dart';
import 'package:english_conversation_app/domain/entities/lesson.dart';

void main() {
  test('Lesson.fromJson / LessonPhrase.fromJson', () {
    final lesson = Lesson.fromJson(const {
      'id': 'daily',
      'title': 'La vie quotidienne',
      'description': 'Phrases utiles.',
      'phrases': [
        {'en': 'Hello', 'fr': 'Bonjour'},
        {'en': 'Thank you', 'fr': 'Merci'},
      ],
    });

    expect(lesson.id, 'daily');
    expect(lesson.title, 'La vie quotidienne');
    expect(lesson.phrases.length, 2);
    expect(lesson.phrases.first.en, 'Hello');
    expect(lesson.phrases.first.fr, 'Bonjour');
    expect(lesson.phrases.last.en, 'Thank you');
  });
}
