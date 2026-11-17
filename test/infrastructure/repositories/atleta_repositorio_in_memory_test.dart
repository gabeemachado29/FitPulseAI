import 'package:fitpulse_ai/domain/entities/atleta.dart';
import 'package:fitpulse_ai/domain/value_objects/result.dart';
import 'package:fitpulse_ai/infrastructure/repositories/atleta_repositorio_in_memory.dart';
import 'package:test/test.dart';

void main() {
  group('Adaptador AtletaRepositorioInMemory', () {
    test('deve persistir em memória e recuperar atleta corretamente', () {
      final repo = AtletaRepositorioInMemory();

      const atleta = Atleta(
        id: 'atleta-in-mem-1',
        pesoKg: 70.0,
        alturaCm: 172.0,
        idadeAnos: 27,
        sexo: SexoBiologico.feminino,
        nivelAtividade: NivelAtividade.muitoAtivo,
      );

      final resultadoSalvar = repo.salvar(atleta);
      expect(resultadoSalvar.isSuccess, isTrue);

      final resultadoBuscar = repo.buscarPorId('atleta-in-mem-1');
      expect(resultadoBuscar, isA<Success<Atleta, String>>());
      final encontrado = (resultadoBuscar as Success<Atleta, String>).valor;
      expect(encontrado.id, equals('atleta-in-mem-1'));
      expect(encontrado.sexo, equals(SexoBiologico.feminino));
    });

    test('deve retornar Failure ao buscar ID não existente', () {
      final repo = AtletaRepositorioInMemory();
      final resultado = repo.buscarPorId('inexistente');
      expect(resultado, isA<Failure<Atleta, String>>());
    });
  });
}
