import 'package:fitpulse_ai/domain/entities/atleta.dart';
import 'package:fitpulse_ai/domain/ports/atleta_repositorio.dart';
import 'package:fitpulse_ai/presentation/widgets/dashboard_balanco_calorico.dart';
import 'package:flutter/material.dart';

/// Shell principal da aplicação FitPulse AI.
class FitPulseApp extends StatelessWidget {
  final AtletaRepositorio repositorio;

  const FitPulseApp({
    super.key,
    required this.repositorio,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FitPulse AI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.deepPurple,
          brightness: Brightness.dark,
        ),
      ),
      home: _HomePage(repositorio: repositorio),
    );
  }
}

class _HomePage extends StatefulWidget {
  final AtletaRepositorio repositorio;

  const _HomePage({required this.repositorio});

  @override
  State<_HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<_HomePage> {
  Atleta? _atleta;
  String? _erro;

  @override
  void initState() {
    super.initState();
    _carregarAtleta();
  }

  void _carregarAtleta() {
    final resultado = widget.repositorio.buscarPorId('atleta-principal');
    resultado.fold(
      onSuccess: (atleta) => setState(() => _atleta = atleta),
      onFailure: (erro) => setState(() => _erro = erro),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('FitPulse AI'),
        centerTitle: true,
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_erro != null) {
      return Center(
        child: Text(
          'Erro ao carregar dados: $_erro',
          style: const TextStyle(color: Colors.redAccent),
        ),
      );
    }

    final atleta = _atleta;
    if (atleta == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return DashboardBalancoCalorico(
      atleta: atleta,
      gastoTreinoKcal: 650.0,
      totalRefeicoesKcal: 1650.0,
    );
  }
}
