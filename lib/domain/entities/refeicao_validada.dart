import 'package:fitpulse_ai/domain/value_objects/macronutrientes.dart';

/// Entidade imutável que representa uma refeição validada composta por itens de macronutrientes.
final class RefeicaoValidada {
  final String id;
  final String descricao;
  final List<Macronutrientes> itens;

  const RefeicaoValidada({
    required this.id,
    required this.descricao,
    required this.itens,
  });

  /// Soma o valor calórico total de todos os itens que compõem a refeição.
  double get totalCalorico =>
      itens.fold(0.0, (acc, item) => acc + item.caloriasTotais);

  RefeicaoValidada copyWith({
    String? id,
    String? descricao,
    List<Macronutrientes>? itens,
  }) {
    return RefeicaoValidada(
      id: id ?? this.id,
      descricao: descricao ?? this.descricao,
      itens: itens ?? this.itens,
    );
  }
}
