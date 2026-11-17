import 'package:fitpulse_ai/domain/value_objects/result.dart';

/// Entidade imutável que representa uma atividade física importada de serviço externo (Strava).
final class AtividadeStrava {
  final String id;
  final double distanciaMetros;
  final int duracaoSegundos;
  final double gastoCaloricoKcal;

  const AtividadeStrava({
    required this.id,
    required this.distanciaMetros,
    required this.duracaoSegundos,
    required this.gastoCaloricoKcal,
  });

  AtividadeStrava copyWith({
    String? id,
    double? distanciaMetros,
    int? duracaoSegundos,
    double? gastoCaloricoKcal,
  }) {
    return AtividadeStrava(
      id: id ?? this.id,
      distanciaMetros: distanciaMetros ?? this.distanciaMetros,
      duracaoSegundos: duracaoSegundos ?? this.duracaoSegundos,
      gastoCaloricoKcal: gastoCaloricoKcal ?? this.gastoCaloricoKcal,
    );
  }
}

/// Porta abstrata para integração com o Strava.
///
/// Segue a Lei da Ausência de Exceções: retorna [Future<Result<List<AtividadeStrava>, String>>].
abstract interface class StravaPort {
  Future<Result<List<AtividadeStrava>, String>> buscarUltimasAtividades({
    required String atletaId,
    required int limite,
  });
}
