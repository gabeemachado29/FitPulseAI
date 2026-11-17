import 'package:fitpulse_ai/domain/entities/atleta.dart';
import 'package:fitpulse_ai/domain/ports/atleta_repositorio.dart';
import 'package:fitpulse_ai/domain/services/balanco_calorico_service.dart';
import 'package:fitpulse_ai/domain/value_objects/macronutrientes.dart';
import 'package:fitpulse_ai/domain/value_objects/result.dart';
import 'package:test/test.dart';

/// Repositório In-Memory usado exclusivamente nos testes de fluxo monadic.
class AtletaRepositorioInMemory implements AtletaRepositorio {
  final Map<String, Atleta> _store = {};

  @override
  Result<void, String> salvar(Atleta atleta) {
    _store[atleta.id] = atleta;
    return const Success(null);
  }

  @override
  Result<Atleta, String> buscarPorId(String id) {
    final atleta = _store[id];
    if (atleta == null) {
      return Failure('Atleta não encontrado: $id');
    }
    return Success(atleta);
  }
}

void main() {
  group('Fluxo Monadic Completo - Buscar Atleta e Calcular Balanço', () {
    // T10: Fluxo monadic completo com fold sobre Result de buscar atleta e calcular balanço
    test(
      'T10: deve encadear busca do atleta via fold e calcular balanço calórico no caminho Success',
      () {
        final repo = AtletaRepositorioInMemory();

        const atleta = Atleta(
          id: 'atleta-flow-001',
          pesoKg: 80.0,
          alturaCm: 180.0,
          idadeAnos: 30,
          sexo: SexoBiologico.masculino,
          nivelAtividade: NivelAtividade.moderadamenteAtivo,
        );

        repo.salvar(atleta);

        // Ingestão: 1650.0 kcal
        final ingerido = (Macronutrientes.criar(
          proteinasG: 100.0,
          carboidratosG: 200.0,
          gordurasG: 50.0,
        ) as Success<Macronutrientes, DomainError>)
            .valor;

        // Fluxo monadic: buscar -> calcular GET -> balanço
        final resultado = repo.buscarPorId('atleta-flow-001').fold(
          onSuccess: (encontrado) {
            final get = encontrado.calcularGET();
            final balanco = BalancoCaloricoService.calcular(
              gastoEnergeticoTotal: get,
              totalIngerido: ingerido.caloriasTotais,
            );
            return Success<double, String>(balanco);
          },
          onFailure: (erro) => Failure<double, String>(erro),
        );

        expect(resultado, isA<Success<double, String>>());
        final balanco = (resultado as Success<double, String>).valor;
        // GET = 1780.0 * 1.55 = 2759.0; Balanço = 2759.0 - 1650.0 = 1109.0
        expect(balanco, equals(1109.0));
      },
    );

    test(
      'T10b: deve retornar Failure quando atleta não é encontrado no repositório',
      () {
        final repo = AtletaRepositorioInMemory();

        final resultado = repo.buscarPorId('nao-existe').fold(
          onSuccess: (encontrado) =>
              const Success<double, String>(0.0),
          onFailure: (erro) => Failure<double, String>(erro),
        );

        expect(resultado, isA<Failure<double, String>>());
        final erro = (resultado as Failure<double, String>).erro;
        expect(erro, contains('nao-existe'));
      },
    );
  });
}
