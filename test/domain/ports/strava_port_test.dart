import 'package:fitpulse_ai/domain/ports/strava_port.dart';
import 'package:fitpulse_ai/domain/value_objects/result.dart';
import 'package:test/test.dart';

void main() {
  group('AtividadeStrava & StravaPort - Telemetria e Integração', () {
    test(
      'deve instanciar AtividadeStrava com imutabilidade e atributos canônicos',
      () {
        const atividade = AtividadeStrava(
          id: 'strava-act-001',
          distanciaMetros: 10000.0,
          duracaoSegundos: 3000,
          gastoCaloricoKcal: 650.0,
        );

        expect(atividade.id, equals('strava-act-001'));
        expect(atividade.distanciaMetros, equals(10000.0));
        expect(atividade.duracaoSegundos, equals(3000));
        expect(atividade.gastoCaloricoKcal, equals(650.0));
      },
    );

    test(
      'deve retornar Success com lista de atividades ao consultar StravaPort',
      () async {
        final StravaPort port = _StravaPortMockSuccess();

        final resultado = await port.buscarUltimasAtividades(
          atletaId: 'atleta-001',
          limite: 5,
        );

        expect(resultado, isA<Success<List<AtividadeStrava>, String>>());
        final lista = (resultado as Success<List<AtividadeStrava>, String>).valor;
        expect(lista.length, equals(1));
        expect(lista.first.gastoCaloricoKcal, equals(500.0));
      },
    );

    test(
      'deve retornar Failure("Erro de Conexão") quando API do Strava estiver indisponível',
      () async {
        final StravaPort port = _StravaPortMockFailure();

        final resultado = await port.buscarUltimasAtividades(
          atletaId: 'atleta-001',
          limite: 5,
        );

        expect(resultado, isA<Failure<List<AtividadeStrava>, String>>());
        final erro = (resultado as Failure<List<AtividadeStrava>, String>).erro;
        expect(erro, equals('Erro de Conexão'));
      },
    );
  });
}

class _StravaPortMockSuccess implements StravaPort {
  @override
  Future<Result<List<AtividadeStrava>, String>> buscarUltimasAtividades({
    required String atletaId,
    required int limite,
  }) async {
    return const Success([
      AtividadeStrava(
        id: 'act-1',
        distanciaMetros: 5000.0,
        duracaoSegundos: 1500,
        gastoCaloricoKcal: 500.0,
      ),
    ]);
  }
}

class _StravaPortMockFailure implements StravaPort {
  @override
  Future<Result<List<AtividadeStrava>, String>> buscarUltimasAtividades({
    required String atletaId,
    required int limite,
  }) async {
    return const Failure('Erro de Conexão');
  }
}
