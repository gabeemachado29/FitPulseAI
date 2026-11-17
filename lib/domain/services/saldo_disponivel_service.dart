/// Serviço de domínio puro para cálculo de saldo calórico disponível com treinos.
///
/// Implementa a Equação Canônica 5.3:
/// E_disponível = GET + E_treino - E_refeições
final class SaldoDisponivelService {
  SaldoDisponivelService._();

  /// Calcula o saldo calórico residual disponível para o atleta no dia.
  ///
  /// - [gastoEnergeticoTotal]: Gasto Energético Total (GET) em kcal.
  /// - [gastoTreinoKcal]: Gasto energético advindo de treinos esportivos em kcal.
  /// - [totalRefeicoesKcal]: Soma energética de todas as refeições consumidas em kcal.
  static double calcular({
    required double gastoEnergeticoTotal,
    required double gastoTreinoKcal,
    required double totalRefeicoesKcal,
  }) {
    return gastoEnergeticoTotal + gastoTreinoKcal - totalRefeicoesKcal;
  }
}
