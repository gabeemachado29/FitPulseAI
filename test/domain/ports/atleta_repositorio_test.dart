import 'package:fitpulse_ai/domain/entities/atleta.dart';
import 'package:fitpulse_ai/domain/ports/atleta_repositorio.dart';
import 'package:fitpulse_ai/domain/value_objects/result.dart';
import 'package:test/test.dart';

/// Implementação In-Memory para teste da porta AtletaRepositorio.
/// Vive exclusivamente no teste — sem mocks, sem dependências externas.
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
  group('Porta AtletaRepositorio - Contrato de Persistência', () {
    // T8: Porta AtletaRepositorio com salvar e buscarPorId retornando Result
    test(
      'T8: deve salvar e buscar atleta retornando Success, e retornar Failure para id inexistente',
      () {
        final repo = AtletaRepositorioInMemory();

        const atleta = Atleta(
          id: 'atleta-repo-001',
          pesoKg: 75.0,
          alturaCm: 175.0,
          idadeAnos: 28,
          sexo: SexoBiologico.masculino,
          nivelAtividade: NivelAtividade.moderadamenteAtivo,
        );

        // Salvar deve retornar Success
        final resultadoSalvar = repo.salvar(atleta);
        expect(resultadoSalvar.isSuccess, isTrue);

        // Buscar existente deve retornar Success com o atleta correto
        final resultadoBuscar = repo.buscarPorId('atleta-repo-001');
        expect(resultadoBuscar, isA<Success<Atleta, String>>());
        final encontrado =
            (resultadoBuscar as Success<Atleta, String>).valor;
        expect(encontrado.id, equals('atleta-repo-001'));
        expect(encontrado.pesoKg, equals(75.0));

        // Buscar inexistente deve retornar Failure
        final resultadoInexistente = repo.buscarPorId('nao-existe');
        expect(resultadoInexistente, isA<Failure<Atleta, String>>());
        expect(resultadoInexistente.isFailure, isTrue);
      },
    );
  });
}
