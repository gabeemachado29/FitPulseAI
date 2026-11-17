import 'package:fitpulse_ai/domain/entities/atleta.dart';
import 'package:fitpulse_ai/presentation/widgets/dashboard_balanco_calorico.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('DashboardBalancoCalorico Widget - Apresentação Desacoplada', () {
    testWidgets(
      'deve renderizar TMB, GET e Saldo Disponível calculados deterministamente pelo Functional Core',
      (tester) async {
        const atleta = Atleta(
          id: 'atleta-ui-1',
          pesoKg: 80.0,
          alturaCm: 180.0,
          idadeAnos: 30,
          sexo: SexoBiologico.masculino,
          nivelAtividade: NivelAtividade.moderadamenteAtivo,
        );

        // TMB = 1780.0 kcal, GET = 2759.0 kcal, Treino = 650.0 kcal, Refeições = 1650.0 kcal
        // Saldo = 2759.0 + 650.0 - 1650.0 = 1759.0 kcal
        await tester.pumpWidget(
          const MaterialApp(
            home: Scaffold(
              body: DashboardBalancoCalorico(
                atleta: atleta,
                gastoTreinoKcal: 650.0,
                totalRefeicoesKcal: 1650.0,
              ),
            ),
          ),
        );

        expect(find.text('FitPulse AI - Balanço Calórico'), findsOneWidget);
        expect(find.text('1780.0 kcal'), findsOneWidget);
        expect(find.text('2759.0 kcal'), findsOneWidget);
        expect(find.text('1759.0 kcal'), findsOneWidget);
      },
    );
  });
}
