import 'package:fitpulse_ai/domain/entities/atleta.dart';
import 'package:fitpulse_ai/domain/entities/refeicao_validada.dart';
import 'package:fitpulse_ai/domain/ports/strava_port.dart';
import 'package:fitpulse_ai/domain/services/saldo_disponivel_service.dart';
import 'package:fitpulse_ai/domain/value_objects/macronutrientes.dart';
import 'package:fitpulse_ai/domain/value_objects/result.dart';
import 'package:test/test.dart';

void main() {
  group('SaldoDisponivelService - Balanço Calórico com Treino', () {
    test(
      'deve calcular Saldo = GET + GastoTreino - TotalRefeicoes com determinismo total',
      () {
        // Atleta masculino: TMB = 1780.0 kcal, GET = 1780.0 * 1.55 = 2759.0 kcal
        const atleta = Atleta(
          id: 'atleta-saldo-001',
          pesoKg: 80.0,
          alturaCm: 180.0,
          idadeAnos: 30,
          sexo: SexoBiologico.masculino,
          nivelAtividade: NivelAtividade.moderadamenteAtivo,
        );
        final get = atleta.calcularGET();

        // Treino Strava: 650.0 kcal
        const treino = AtividadeStrava(
          id: 'act-001',
          distanciaMetros: 10000.0,
          duracaoSegundos: 3600,
          gastoCaloricoKcal: 650.0,
        );

        // Refeições: 100g P, 200g C, 50g G = 1650.0 kcal
        final macroSuccess = Macronutrientes.criar(
          proteinasG: 100.0,
          carboidratosG: 200.0,
          gordurasG: 50.0,
        ) as Success<Macronutrientes, DomainError>;

        final refeicao = RefeicaoValidada(
          id: 'ref-001',
          descricao: 'Almoço e Lanche',
          itens: [macroSuccess.valor],
        );

        // Equação Canônica 5.3:
        // E_disponivel = GET (2759.0) + E_treino (650.0) - E_refeicoes (1650.0) = 1759.0 kcal
        final saldo = SaldoDisponivelService.calcular(
          gastoEnergeticoTotal: get,
          gastoTreinoKcal: treino.gastoCaloricoKcal,
          totalRefeicoesKcal: refeicao.totalCalorico,
        );

        expect(saldo, equals(1759.0));
      },
    );
  });
}
