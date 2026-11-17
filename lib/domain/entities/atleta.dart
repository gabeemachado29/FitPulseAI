enum SexoBiologico {
  masculino,
  feminino,
}

enum NivelAtividade {
  sedentario(1.2),
  levementeAtivo(1.375),
  moderadamenteAtivo(1.55),
  muitoAtivo(1.725),
  extremamenteAtivo(1.9);

  final double fator;
  const NivelAtividade(this.fator);
}

final class Atleta {
  final String id;
  final double pesoKg;
  final double alturaCm;
  final int idadeAnos;
  final SexoBiologico sexo;
  final NivelAtividade nivelAtividade;

  const Atleta({
    required this.id,
    required this.pesoKg,
    required this.alturaCm,
    required this.idadeAnos,
    required this.sexo,
    required this.nivelAtividade,
  });

  /// Calcula a Taxa Metabólica Basal (TMB) usando a equação canônica de Mifflin-St Jeor.
  ///
  /// Masculino: (10.0 * pesoKg) + (6.25 * alturaCm) - (5.0 * idadeAnos) + 5.0
  /// Feminino:  (10.0 * pesoKg) + (6.25 * alturaCm) - (5.0 * idadeAnos) - 161.0
  double calcularTMB() {
    final base = (10.0 * pesoKg) + (6.25 * alturaCm) - (5.0 * idadeAnos);
    return switch (sexo) {
      SexoBiologico.masculino => base + 5.0,
      SexoBiologico.feminino => base - 161.0,
    };
  }

  /// Calcula o Gasto Energético Total (GET) multiplicando a TMB pelo fator de atividade física.
  double calcularGET() {
    return calcularTMB() * nivelAtividade.fator;
  }

  Atleta copyWith({
    String? id,
    double? pesoKg,
    double? alturaCm,
    int? idadeAnos,
    SexoBiologico? sexo,
    NivelAtividade? nivelAtividade,
  }) {
    return Atleta(
      id: id ?? this.id,
      pesoKg: pesoKg ?? this.pesoKg,
      alturaCm: alturaCm ?? this.alturaCm,
      idadeAnos: idadeAnos ?? this.idadeAnos,
      sexo: sexo ?? this.sexo,
      nivelAtividade: nivelAtividade ?? this.nivelAtividade,
    );
  }
}
