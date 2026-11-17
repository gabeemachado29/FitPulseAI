import 'package:fitpulse_ai/domain/entities/atleta.dart';
import 'package:fitpulse_ai/domain/services/balanco_calorico_service.dart';
import 'package:fitpulse_ai/domain/value_objects/macronutrientes.dart';
import 'package:fitpulse_ai/domain/value_objects/result.dart';
import 'package:test/test.dart';

void main() {
  group('BalancoCaloricoService - Deficit e Superávit', () {
    // T9: Serviço calcula deficit/superávit calórico = GET - totalIngerido
    test(
      'T9: deve calcular balanço calórico como GET menos total ingerido (deficit negativo, superávit positivo)',
      () {
        const atleta = Atleta(
          id: 'atleta-bal-001',
          pesoKg: 80.0,
          alturaCm: 180.0,
          idadeAnos: 30,
          sexo: SexoBiologico.masculino,
          nivelAtividade: NivelAtividade.moderadamenteAtivo,
        );

        // GET = 1780.0 * 1.55 = 2759.0 kcal
        final get = atleta.calcularGET();
        expect(get, equals(2759.0));

        // Ingestão: (100 * 4) + (200 * 4) + (50 * 9) = 400 + 800 + 450 = 1650.0 kcal
        final ingerido = (Macronutrientes.criar(
          proteinasG: 100.0,
          carboidratosG: 200.0,
          gordurasG: 50.0,
        ) as Success<Macronutrientes, DomainError>)
            .valor;

        // Balanço: 2759.0 - 1650.0 = 1109.0 (superávit calórico)
        final balanco = BalancoCaloricoService.calcular(
          gastoEnergeticoTotal: get,
          totalIngerido: ingerido.caloriasTotais,
        );

        expect(balanco, equals(1109.0));
      },
    );
  });
}
