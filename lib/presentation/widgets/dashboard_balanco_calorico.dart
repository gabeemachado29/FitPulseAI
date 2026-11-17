import 'package:fitpulse_ai/domain/entities/atleta.dart';
import 'package:fitpulse_ai/domain/services/saldo_disponivel_service.dart';
import 'package:flutter/material.dart';

/// Widget de apresentação para visualização dos indicadores metabólicos e balanço energético.
///
/// Não duplica lógica de cálculo: delega 100% dos cálculos para o Functional Core.
class DashboardBalancoCalorico extends StatelessWidget {
  final Atleta atleta;
  final double gastoTreinoKcal;
  final double totalRefeicoesKcal;

  const DashboardBalancoCalorico({
    super.key,
    required this.atleta,
    required this.gastoTreinoKcal,
    required this.totalRefeicoesKcal,
  });

  @override
  Widget build(BuildContext context) {
    final tmb = atleta.calcularTMB();
    final get = atleta.calcularGET();
    final saldoDisponivel = SaldoDisponivelService.calcular(
      gastoEnergeticoTotal: get,
      gastoTreinoKcal: gastoTreinoKcal,
      totalRefeicoesKcal: totalRefeicoesKcal,
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'FitPulse AI - Balanço Calórico',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 16.0),
          _buildCard(
            context,
            titulo: 'Taxa Metabólica Basal (TMB)',
            valor: '${tmb.toStringAsFixed(1)} kcal',
            icone: Icons.monitor_heart,
            cor: Colors.blueAccent,
          ),
          const SizedBox(height: 12.0),
          _buildCard(
            context,
            titulo: 'Gasto Energético Total (GET)',
            valor: '${get.toStringAsFixed(1)} kcal',
            icone: Icons.local_fire_department,
            cor: Colors.orangeAccent,
          ),
          const SizedBox(height: 12.0),
          _buildCard(
            context,
            titulo: 'Saldo Calórico Disponível',
            valor: '${saldoDisponivel.toStringAsFixed(1)} kcal',
            icone: Icons.bolt,
            cor: Colors.greenAccent,
          ),
        ],
      ),
    );
  }

  Widget _buildCard(
    BuildContext context, {
    required String titulo,
    required String valor,
    required IconData icone,
    required Color cor,
  }) {
    return Card(
      elevation: 2.0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: cor.withValues(alpha: 0.2),
              child: Icon(icone, color: cor),
            ),
            const SizedBox(width: 16.0),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    titulo,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey[700],
                        ),
                  ),
                  const SizedBox(height: 4.0),
                  Text(
                    valor,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
