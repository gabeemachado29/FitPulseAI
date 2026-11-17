import 'package:fitpulse_ai/domain/entities/refeicao_validada.dart';
import 'package:fitpulse_ai/domain/value_objects/macronutrientes.dart';
import 'package:fitpulse_ai/domain/value_objects/result.dart';
import 'package:test/test.dart';

void main() {
  group('Entidade RefeicaoValidada - Composição de Macronutrientes', () {
    // T7: RefeicaoValidada com lista de Macronutrientes -> totalCalorico correto
    test(
      'T7: deve calcular totalCalorico como soma das caloriasTotais de todos os itens',
      () {
        // Item 1: (30 * 4) + (50 * 4) + (10 * 9) = 120 + 200 + 90 = 410.0 kcal
        final r1 = Macronutrientes.criar(
          proteinasG: 30.0,
          carboidratosG: 50.0,
          gordurasG: 10.0,
        ) as Success<Macronutrientes, DomainError>;

        // Item 2: (20 * 4) + (100 * 4) + (15 * 9) = 80 + 400 + 135 = 615.0 kcal
        final r2 = Macronutrientes.criar(
          proteinasG: 20.0,
          carboidratosG: 100.0,
          gordurasG: 15.0,
        ) as Success<Macronutrientes, DomainError>;

        final refeicao = RefeicaoValidada(
          id: 'ref-001',
          descricao: 'Almoço',
          itens: [r1.valor, r2.valor],
        );

        // Total: 410.0 + 615.0 = 1025.0 kcal
        expect(refeicao.totalCalorico, equals(1025.0));
        expect(refeicao.itens.length, equals(2));
      },
    );
  });
}
