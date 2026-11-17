import 'package:fitpulse_ai/domain/entities/atleta.dart';
import 'package:fitpulse_ai/domain/value_objects/result.dart';

/// Porta abstrata de persistência para a entidade [Atleta].
///
/// Segue a Lei da Ausência de Exceções Lançadas: todo retorno de negócio
/// ou persistência é envelopado na mônada [Result].
abstract interface class AtletaRepositorio {
  Result<void, String> salvar(Atleta atleta);
  Result<Atleta, String> buscarPorId(String id);
}
