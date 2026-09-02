import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:english_conversation_app/app/app.dart';

void main() {
  testWidgets('L\'app demarre sur l\'onboarding (Material 3)', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: App()));
    await tester.pumpAndSettle();

    expect(find.byType(MaterialApp), findsOneWidget);
    // Ecran initial : choix du niveau.
    expect(find.textContaining('niveau'), findsWidgets);
    // Les six niveaux CEFR sont proposes.
    expect(find.byType(ChoiceChip), findsNWidgets(6));
  });
}
