import 'package:fitpulse_ai/domain/entities/atleta.dart';
import 'package:fitpulse_ai/infrastructure/repositories/atleta_repositorio_in_memory.dart';
import 'package:fitpulse_ai/presentation/fitpulse_app.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('FitPulseApp Shell Integration', () {
    testWidgets('deve carregar atleta do repositorio e renderizar o dashboard', (tester) async {
      final repo = AtletaRepositorioInMemory();
      repo.salvar(
        const Atleta(
          id: 'atleta-principal',
          pesoKg: 80.0,
          alturaCm: 180.0,
          idadeAnos: 30,
          sexo: SexoBiologico.masculino,
          nivelAtividade: NivelAtividade.moderadamenteAtivo,
        ),
      );

      await tester.pumpWidget(FitPulseApp(repositorio: repo));
      await tester.pumpAndSettle();

      expect(find.text('FitPulse AI'), findsOneWidget);
      expect(find.text('FitPulse AI - Balanço Calórico'), findsOneWidget);
      expect(find.text('1780.0 kcal'), findsOneWidget);
      expect(find.text('2759.0 kcal'), findsOneWidget);
      expect(find.text('1759.0 kcal'), findsOneWidget);
    });

    testWidgets('deve exibir mensagem de erro quando o atleta nao existe', (tester) async {
      final repo = AtletaRepositorioInMemory(); // Vazio

      await tester.pumpWidget(FitPulseApp(repositorio: repo));
      await tester.pumpAndSettle();

      expect(find.textContaining('Erro ao carregar dados'), findsOneWidget);
    });
  });
}
