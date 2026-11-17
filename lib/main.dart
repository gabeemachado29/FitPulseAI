import 'package:fitpulse_ai/domain/entities/atleta.dart';
import 'package:fitpulse_ai/infrastructure/repositories/atleta_repositorio_in_memory.dart';
import 'package:fitpulse_ai/presentation/fitpulse_app.dart';
import 'package:flutter/material.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Inicializa o repositório in-memory e registra o atleta canônico
  final repositorio = AtletaRepositorioInMemory();
  repositorio.salvar(
    const Atleta(
      id: 'atleta-principal',
      pesoKg: 80.0,
      alturaCm: 180.0,
      idadeAnos: 30,
      sexo: SexoBiologico.masculino,
      nivelAtividade: NivelAtividade.moderadamenteAtivo,
    ),
  );

  runApp(FitPulseApp(repositorio: repositorio));
}
