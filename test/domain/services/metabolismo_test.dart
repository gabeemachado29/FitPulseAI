import 'package:fitpulse_ai/domain/entities/atleta.dart';
import 'package:test/test.dart';

void main() {
  group('Motor Metabólico (Mifflin-St Jeor) - TMB e GET', () {
    // T1: Cálculo TMB Masculino (80kg, 180cm, 30 anos) -> exatamente 1780.0 kcal
    test(
      'T1: deve calcular a TMB para sexo masculino corretamente (80kg, 180cm, 30 anos -> 1780.0 kcal)',
      () {
        const atleta = Atleta(
          id: 'atleta-001',
          pesoKg: 80.0,
          alturaCm: 180.0,
          idadeAnos: 30,
          sexo: SexoBiologico.masculino,
          nivelAtividade: NivelAtividade.sedentario,
        );

        final tmb = atleta.calcularTMB();

        expect(tmb, equals(1780.0));
      },
    );

    // T2: Cálculo TMB Feminino (60kg, 165cm, 25 anos) -> exatamente 1345.25 kcal
    test(
      'T2: deve calcular a TMB para sexo feminino corretamente (60kg, 165cm, 25 anos -> 1345.25 kcal)',
      () {
        const atleta = Atleta(
          id: 'atleta-002',
          pesoKg: 60.0,
          alturaCm: 165.0,
          idadeAnos: 25,
          sexo: SexoBiologico.feminino,
          nivelAtividade: NivelAtividade.sedentario,
        );

        final tmb = atleta.calcularTMB();

        expect(tmb, equals(1345.25));
      },
    );

    // T3: Cálculo GET com NivelAtividade.moderadamenteAtivo -> TMB * 1.55
    test(
      'T3: deve calcular o GET multiplicando a TMB pelo fator de atividade moderada (1.55)',
      () {
        const atleta = Atleta(
          id: 'atleta-003',
          pesoKg: 80.0,
          alturaCm: 180.0,
          idadeAnos: 30,
          sexo: SexoBiologico.masculino,
          nivelAtividade: NivelAtividade.moderadamenteAtivo,
        );

        final tmbEsperada = atleta.calcularTMB();
        final getCalculado = atleta.calcularGET();

        expect(atleta.nivelAtividade.fator, equals(1.55));
        expect(getCalculado, equals(tmbEsperada * 1.55));
        expect(getCalculado, equals(1780.0 * 1.55));
      },
    );
  });
}
