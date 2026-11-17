import 'package:test/test.dart';
import 'package:fitpulse_ai/domain/value_objects/result.dart';
import 'package:fitpulse_ai/domain/value_objects/macronutrientes.dart';

void main() {
  group('Value Object Macronutrientes - Criação e Operações', () {
    // T4: Construção com valores válidos (100g P, 200g C, 50g G) -> Sucesso, caloriasTotais = 1650.0 kcal
    // Cálculo: (100 * 4) + (200 * 4) + (50 * 9) = 400 + 800 + 450 = 1650.0
    test(
      'T4: deve criar Macronutrientes válidos e calcular caloriasTotais corretamente (1650.0 kcal)',
      () {
        final resultado = Macronutrientes.criar(
          proteinasG: 100.0,
          carboidratosG: 200.0,
          gordurasG: 50.0,
        );

        expect(resultado, isA<Success<Macronutrientes, DomainError>>());

        final macros = (resultado as Success<Macronutrientes, DomainError>).valor;
        expect(macros.proteinasG, equals(100.0));
        expect(macros.carboidratosG, equals(200.0));
        expect(macros.gordurasG, equals(50.0));
        expect(macros.caloriasTotais, equals(1650.0));
      },
    );

    // T5: Tentativa de construção com valor negativo -> Failure(DomainError.valorNegativo)
    test(
      'T5: deve retornar Failure(DomainError.valorNegativo) ao receber gramas negativas',
      () {
        final resultado = Macronutrientes.criar(
          proteinasG: -10.0,
          carboidratosG: 200.0,
          gordurasG: 50.0,
        );

        expect(resultado, isA<Failure<Macronutrientes, DomainError>>());

        final falha = (resultado as Failure<Macronutrientes, DomainError>).erro;
        expect(falha, equals(DomainError.valorNegativo));
      },
    );

    // T6: Somatória de dois objetos Macronutrientes -> Instância acumulada com soma exata dos gramas
    test(
      'T6: deve somar dois Macronutrientes produzindo instância acumulada com gramas exatos',
      () {
        final r1 = Macronutrientes.criar(
          proteinasG: 30.0,
          carboidratosG: 50.0,
          gordurasG: 10.0,
        ) as Success<Macronutrientes, DomainError>;

        final r2 = Macronutrientes.criar(
          proteinasG: 20.0,
          carboidratosG: 100.0,
          gordurasG: 15.0,
        ) as Success<Macronutrientes, DomainError>;

        final somado = r1.valor.somar(r2.valor);

        expect(somado.proteinasG, equals(50.0));
        expect(somado.carboidratosG, equals(150.0));
        expect(somado.gordurasG, equals(25.0));
        // Cálculo: (50 * 4) + (150 * 4) + (25 * 9) = 200 + 600 + 225 = 1025.0
        expect(somado.caloriasTotais, equals(1025.0));
      },
    );
  });
}
