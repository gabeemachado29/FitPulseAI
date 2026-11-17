# FitPulse AI — Documento Vivo de Memória e Progresso

**Fonte Única da Verdade (SSOT)**  
Baseado no documento oficial: *"FitPulse AI - Fundação Técnica, Governança e Especificação Canônica v0.1"*  
**Paradigma:** Arquitetura Hexagonal, Functional Core & Local-First Determinístico  
**Stack Primária:** Dart 3.x (Sound Null Safety rigoroso, Record Types, Pattern Matching), Flutter 3.x  

---

## 1. Status do Ciclo TDD
- **Fase Atual:** 🔴 **RED**
- **Fatia em Execução:** **Fatia 3: Integrações Externas, Telemetria & Strava Adapter**
- **Testes Concluídos Anteriores:** 13/13 testes passando (Fatias 1 e 2 100% GREEN e comitadas).
- **Testes da Fase RED da Fatia 3:**
  - `test/domain/ports/strava_port_test.dart` (Entidade `AtividadeStrava`, porta `StravaPort`, cenários Success e Failure)
  - `test/domain/services/saldo_disponivel_service_test.dart` (Equação 5.3: $E_{\text{disponível}} = \text{GET} + E_{\text{treino}} - \sum E_{\text{refeições}}$)
- **Resultado do Runner:** Falhas esperadas por ausência de `AtividadeStrava`, `StravaPort` e `SaldoDisponivelService`.

---

## 2. Leis Invioláveis de Governança Aplicadas
1. **Lei do Núcleo Puro (Pure Core Law):** O pacote `lib/domain/` utiliza APENAS Dart puro. Zero dependências de Flutter ou pacotes externos.
2. **Lei da Imutabilidade Absoluta:** Todas as entidades e Value Objects são `final` e imutáveis, provendo `copyWith` seguro.
3. **Lei da Ausência de Exceções Lançadas:** O fluxo de controle de negócio jamais utiliza `throw`. Tratamento via monadic `Result<S, F>`.
4. **Lei do Parse, Don't Validate:** Tipos genéricos brutos são convertidos em Value Objects tipados na entrada com validação formal (factory `criar`).
5. **Lei do Determinismo Total:** Mesma entrada no Functional Core = saída matematicamente idêntica.
6. **TDD Radical Invertido:** Nenhuma linha de código de produção é gerada antes de uma suíte de testes falhando (Red).

---

## 3. Decisões Arquiteturais Registradas (ADRs)
- **ADR-01 (Uso de Arquitetura Hexagonal):** Separação estrita entre Core (`lib/domain/`), Adaptadores (`lib/infrastructure/`) e UI (`lib/presentation/`).
- **ADR-02 (Adoption do Pattern Result):** Proibição de `throw` em fluxos de negócio. Retorno explícito monádico `Result<S, F>` via `sealed class` com `Success` e `Failure`.
- **ADR-03 (Imutabilidade por Padrão):** Entidades com atributos `final`, construtores `const` e método `copyWith`.
- **ADR-04 (Estratégia Local-First):** Persistência in-memory e local prioritária para funcionamento desacoplado.
- **ADR-06 (Dart Puríssimo no Core):** Zero dependências externas no pacote `domain` para execução instantânea em qualquer runtime.
- **ADR-07 (Formulação Mifflin-St Jeor):** Padronização matemática canônica do cálculo de TMB masculina e feminina.
- **ADR-08 (Fatores de Atwater):** Calorias de macronutrientes calculadas com Proteínas: 4 kcal/g, Carboidratos: 4 kcal/g, Gorduras: 9 kcal/g.
- **ADR-09 (Comunicação Assíncrona e Monádica via Ports):** Portas como contratos abstratos do domínio retornando `Future<Result<S, F>>`.
- **ADR-11 (Tolerância a Falhas no Strava):** Retorno de falha estruturada `Failure("Erro de Conexão")` e desacoplamento do núcleo contra indisponibilidade externa.
- **ADR-12 (Tipagem Enumerada de Atividade):** Fatores de atividade física acoplados aos enums (`sedentario: 1.2`, `levementeAtivo: 1.375`, `moderadamenteAtivo: 1.55`, `muitoAtivo: 1.725`, `extremamenteAtivo: 1.9`).
- **ADR-13 (Armazenamento de Macros com Decimais):** Representação interna de massa em `double` de precisão.
- **ADR-14 (DomainError Tipado):** Erros de domínio representados por `enum DomainError` para exaustividade no `switch`.
- **ADR-16 (Testes Unitários Sem Mocks no Core):** Testes diretos com implementações in-memory puras no arquivo de teste.

---

## 4. Estrutura de Diretórios e Arquivos Atuais
```text
lib/
├── domain/                  # Functional Core (Dart puro)
│   ├── entities/            
│   │   ├── atleta.dart             # Entidade Atleta, SexoBiologico e NivelAtividade
│   │   └── refeicao_validada.dart  # Entidade RefeicaoValidada
│   ├── value_objects/       
│   │   ├── result.dart             # Mônada Result<S, F> (sealed class: Success, Failure)
│   │   └── macronutrientes.dart    # Value Object Macronutrientes + DomainError
│   ├── services/            
│   │   └── balanco_calorico_service.dart # Serviço de balanço energético básico
│   └── ports/               
│       └── atleta_repositorio.dart # Porta abstrata do repositório
├── infrastructure/          # Adapters (Strava, IndexedDB, Repositórios In-Memory)
│   └── repositories/
│       └── atleta_repositorio_in_memory.dart # Adaptador In-Memory do AtletaRepositorio
└── presentation/            # UI Shell (Flutter)

test/
├── domain/
│   ├── entities/
│   │   └── refeicao_validada_test.dart            # Teste T7 (GREEN ✅)
│   ├── ports/
│   │   ├── atleta_repositorio_test.dart           # Teste T8 (GREEN ✅)
│   │   └── strava_port_test.dart                  # AtividadeStrava & StravaPort (RED 🔴)
│   ├── services/
│   │   ├── metabolismo_test.dart                  # Testes T1, T2 e T3 (GREEN ✅)
│   │   ├── balanco_calorico_service_test.dart     # Teste T9 (GREEN ✅)
│   │   ├── fluxo_monadic_test.dart                # Testes T10 e T10b (GREEN ✅)
│   │   └── saldo_disponivel_service_test.dart     # Saldo Disponível com Treino (RED 🔴)
│   └── value_objects/
│       └── macronutrientes_test.dart              # Testes T4, T5 e T6 (GREEN ✅)
└── infrastructure/
    └── repositories/
        └── atleta_repositorio_in_memory_test.dart # Teste do Adaptador In-Memory (GREEN ✅)
```

---

## 5. Progresso das Fatias do Roadmap Canônico

### [Fatia 1: Core Puramente Funcional] (CONCLUÍDA ✅)
- [x] Configuração do ambiente Dart puro e runner de testes unitários (`pubspec.yaml`).
- [x] Criação da estrutura canônica de pastas da Arquitetura Hexagonal (`domain`, `infrastructure`, `presentation`).
- [x] Escrita da suíte de testes TDD canônicos T1 a T3 (`test/domain/services/metabolismo_test.dart`).
- [x] Implementação de `SexoBiologico`, `NivelAtividade` e entidade `Atleta`.
- [x] Suíte de testes T4 a T6 para `Macronutrientes` e mônada `Result<S, F>`.
- [x] Implementação de `Result<S, F>` e `Macronutrientes`.
- [x] Refactor com `analysis_options.yaml` (strict lints e directives ordering).

### [Fatia 2: Mapeamento de Portas & Repositório In-Memory] (CONCLUÍDA ✅)
- [x] Suíte de testes T7 a T10 em arquivos modulares (Fase RED).
- [x] Implementação da entidade `RefeicaoValidada`.
- [x] Implementação da porta abstrata `AtletaRepositorio`.
- [x] Implementação do serviço puro `BalancoCaloricoService`.
- [x] Implementação e testes do adaptador `AtletaRepositorioInMemory`.
- [x] Validação completa: 13/13 testes passando, 0 issues no `dart analyze`.

### [Fatia 3: Integrações Externas, Telemetria & Strava Adapter]
- [x] Criação dos testes para a entidade `AtividadeStrava` e porta `StravaPort` (`test/domain/ports/strava_port_test.dart` - Fase RED).
- [x] Criação dos testes para o cálculo de Saldo Calórico Disponível com treino ($E_{\text{disponível}} = \text{GET} + E_{\text{treino}} - \sum E_{\text{refeições}}$) (`test/domain/services/saldo_disponivel_service_test.dart` - Fase RED).
- [x] Execução dos testes comprovando a fase RED da Fatia 3.
- [ ] Implementação da entidade imutável `AtividadeStrava` e interface `StravaPort` em `lib/domain/ports/strava_port.dart`.
- [ ] Implementação de `SaldoDisponivelService` no domínio (`lib/domain/services/saldo_disponivel_service.dart`).
- [ ] Validação da transição para a fase GREEN (todos os testes passando).
- [ ] Implementação de Adapter Mock/In-Memory do Strava para testes de infraestrutura.

### [Fatia 4: Shell Flutter & Edge AI]
- [ ] Shell Flutter UI Web/Mobile.
- [ ] LLM Parser Local & Sync Off-line Bidirecional.

---

## 6. Próximo Passo Pronto para Copiar e Colar (Next Prompt)

```markdown
Transicione a Fatia 3 do FitPulse AI da fase RED para a fase GREEN:
1. Crie `lib/domain/ports/strava_port.dart` contendo:
   - A classe imutável `AtividadeStrava` (id, distanciaMetros, duracaoSegundos, gastoCaloricoKcal) com construtor const e copyWith.
   - A interface abstrata `abstract interface class StravaPort` com o método assíncrono `Future<Result<List<AtividadeStrava>, String>> buscarUltimasAtividades({required String atletaId, required int limite})`.
2. Crie `lib/domain/services/saldo_disponivel_service.dart` contendo:
   - O serviço puro determinístico `SaldoDisponivelService` com o método `calcular({required double gastoEnergeticoTotal, required double gastoTreinoKcal, required double totalRefeicoesKcal})` aplicando a equação canônica: GET + gastoTreino - totalRefeicoes.
3. Execute todos os testes unitários (`dart test`) comprovando 100% de sucesso.
4. Execute `dart analyze lib/ test/` garantindo 0 warnings/erros.
5. Faça o commit e atualize o arquivo `GEMINI.md`.
```
