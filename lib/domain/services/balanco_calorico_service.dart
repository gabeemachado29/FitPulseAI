/// Serviço de domínio puro para cálculo de balanço energético.
///
/// Determinístico e sem estado (Functional Core).
final class BalancoCaloricoService {
  BalancoCaloricoService._();

  /// Calcula o balanço calórico como a diferença entre o Gasto Energético Total
  /// e o total calórico ingerido.
  ///
  /// Valor positivo indica superávit/saldo remanescente do GET,
  /// valor negativo indica déficit calórico em relação à ingestão.
  static double calcular({
    required double gastoEnergeticoTotal,
    required double totalIngerido,
  }) {
    return gastoEnergeticoTotal - totalIngerido;
  }
}
