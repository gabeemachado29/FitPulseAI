import 'result.dart';

/// Erros de domínio tipados para validação de Value Objects.
enum DomainError {
  valorNegativo,
}

/// Value Object imutável que representa a composição de macronutrientes.
///
/// Criação obrigatoriamente via factory [criar] que retorna [Result],
/// respeitando a Lei "Parse, Don't Validate" e a proibição de `throw`.
///
/// Fatores calóricos canônicos (Atwater):
/// - Proteínas: 4 kcal/g
/// - Carboidratos: 4 kcal/g
/// - Gorduras: 9 kcal/g
final class Macronutrientes {
  final double proteinasG;
  final double carboidratosG;
  final double gordurasG;

  const Macronutrientes._({
    required this.proteinasG,
    required this.carboidratosG,
    required this.gordurasG,
  });

  /// Factory validado que retorna [Success] com a instância válida
  /// ou [Failure] com [DomainError.valorNegativo] se qualquer grama for negativa.
  static Result<Macronutrientes, DomainError> criar({
    required double proteinasG,
    required double carboidratosG,
    required double gordurasG,
  }) {
    if (proteinasG < 0 || carboidratosG < 0 || gordurasG < 0) {
      return const Failure(DomainError.valorNegativo);
    }

    return Success(Macronutrientes._(
      proteinasG: proteinasG,
      carboidratosG: carboidratosG,
      gordurasG: gordurasG,
    ));
  }

  /// Calorias totais calculadas pelos fatores de Atwater.
  double get caloriasTotais =>
      (proteinasG * 4.0) + (carboidratosG * 4.0) + (gordurasG * 9.0);

  /// Soma dois [Macronutrientes] produzindo uma nova instância acumulada.
  /// Ambos os operandos já são válidos (construídos via [criar]),
  /// portanto o resultado é garantidamente válido sem necessidade de re-validação.
  Macronutrientes somar(Macronutrientes outro) {
    return Macronutrientes._(
      proteinasG: proteinasG + outro.proteinasG,
      carboidratosG: carboidratosG + outro.carboidratosG,
      gordurasG: gordurasG + outro.gordurasG,
    );
  }
}
