import 'package:fitpulse_ai/domain/entities/atleta.dart';
import 'package:fitpulse_ai/domain/ports/atleta_repositorio.dart';
import 'package:fitpulse_ai/domain/value_objects/result.dart';

/// Implementação In-Memory do adaptador [AtletaRepositorio].
///
/// Utilizada para execução isolada, testes e ambientes sem persistência em disco.
final class AtletaRepositorioInMemory implements AtletaRepositorio {
  final Map<String, Atleta> _tabela = {};

  @override
  Result<void, String> salvar(Atleta atleta) {
    _tabela[atleta.id] = atleta;
    return const Success(null);
  }

  @override
  Result<Atleta, String> buscarPorId(String id) {
    final atleta = _tabela[id];
    if (atleta == null) {
      return Failure('Atleta não encontrado com o ID: $id');
    }
    return Success(atleta);
  }
}
