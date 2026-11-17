# FitPulse AI — Documento Vivo de Memória e Progresso

**Fonte Única da Verdade (SSOT)**  
Baseado no documento oficial: *"FitPulse AI - Fundação Técnica, Governança e Especificação Canônica v0.1"*  
**Paradigma:** Arquitetura Hexagonal, Functional Core & Local-First Determinístico  
**Stack Primária:** Dart 3.x (Sound Null Safety rigoroso, Record Types, Pattern Matching), Flutter 3.x  

---

## 1. Status do Ciclo TDD
- **Fase Atual:** 🟢 **GREEN** (Fatia 2 concluída com sucesso!)
- **Fatia em Execução:** **Fatia 2: Mapeamento de Portas, Entidades Secundárias & Repositório In-Memory**
- **Testes Concluídos:** 13/13 testes passando (T1 a T10 + casos de borda e repo in-memory):
  - T1, T2, T3: `test/domain/services/metabolismo_test.dart` (TMB e GET)
  - T4, T5, T6: `test/domain/value_objects/macronutrientes_test.dart` (Macronutrientes e Result)
  - T7: `test/domain/entities/refeicao_validada_test.dart` (RefeicaoValidada e totalCalorico)
  - T8: `test/domain/ports/atleta_repositorio_test.dart` (Porta AtletaRepositorio)
  - T9: `test/domain/services/balanco_calorico_service_test.dart` (BalancoCaloricoService)
  - T10, T10b: `test/domain/services/fluxo_monadic_test.dart` (Fluxo Monadic fold encadeado)
  - Repositório In-Memory: `test/infrastructure/repositories/atleta_repositorio_in_memory_test.dart`
- **Análise Estática:** `dart analyze`: **0 issues** com lints estritos ativados.

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
- **ADR-09 (Comunicação Assíncrona e Monádica via Ports):** Portas como contratos abstratos do domínio retornando `Result`.
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
│   │   └── balanco_calorico_service.dart # Serviço de balanço energético
│   └── ports/               
│       └── atleta_repositorio.dart # Porta abstrata do repositório
├── infrastructure/          # Adapters (Strava, IndexedDB, Repositórios In-Memory)
│   └── repositories/
│       └── atleta_repositorio_in_memory.dart # Adaptador In-Memory do AtletaRepositorio
└── presentation/            # UI Shell (Flutter)

test/
├── domain/
│   ├── entities/
│   │   └── refeicao_validada_test.dart        # Teste T7 (GREEN ✅)
│   ├── ports/
│   │   └── atleta_repositorio_test.dart       # Teste T8 (GREEN ✅)
│   ├── services/
│   │   ├── metabolismo_test.dart              # Testes T1, T2 e T3 (GREEN ✅)
│   │   ├── balanco_calorico_service_test.dart # Teste T9 (GREEN ✅)
│   │   └── fluxo_monadic_test.dart            # Testes T10 e T10b (GREEN ✅)
│   └── value_objects/
│       └── macronutrientes_test.dart          # Testes T4, T5 e T6 (GREEN ✅)
└── infrastructure/
    └── repositories/
        └── atleta_repositorio_in_memory_test.dart # Teste do Adaptador In-Memory (GREEN ✅)
```

---

## 5. Progresso das Fatias do Roadmap Canônico

### [Fatia 1: Core Puramente Funcional]
- [x] Configuração do ambiente Dart puro e runner de testes unitários (`pubspec.yaml`).
- [x] Criação da estrutura canônica de pastas da Arquitetura Hexagonal (`domain`, `infrastructure`, `presentation`).
- [x] Escrita da suíte de testes TDD canônicos T1 a T3 (`test/domain/services/metabolismo_test.dart`).
- [x] Execução e validação da fase **RED** (testes T1-T3 falhando por ausência de código de produção).
- [x] Implementação de `SexoBiologico` e `NivelAtividade` com fatores acoplados em `lib/domain/entities/atleta.dart`.
- [x] Implementação da entidade imutável `Atleta` com os métodos `calcularTMB()` e `calcularGET()`.
- [x] Execução da fase **GREEN** para os testes T1, T2 e T3 (3/3 testes passando com sucesso).
- [x] Análise estática de código (`dart analyze`) aprovada sem nenhum aviso.
- [x] Escrita da suíte de testes canônicos T4, T5 e T6 (`test/domain/value_objects/macronutrientes_test.dart`).
- [x] Execução e validação da fase **RED** (testes T4-T6 falhando por ausência de código de produção).
- [x] Implementação da estrutura monádica `Result<S, F>` (`lib/domain/value_objects/result.dart`).
- [x] Implementação do Value Object `Macronutrientes` (`lib/domain/value_objects/macronutrientes.dart`) com factory `criar`, `caloriasTotais` e `somar()`.
- [x] Execução da fase **GREEN** para T4, T5 e T6 (3/3 testes passando com sucesso).
- [x] Refactor da Fatia 1 com `analysis_options.yaml` (strict-casts, strict-inference, strict-raw-types) e ordenação de imports (6/6 testes passando, 0 issues).
- [x] Commit das fases Green e Refactor da Fatia 1.

### [Fatia 2: Mapeamento de Portas & Repositório In-Memory]
- [x] Escrita da suíte de testes canônicos T7 a T10 em arquivos separados.
- [x] Execução e validação da fase **RED** da Fatia 2 (4 arquivos de teste falhando por ausência de código de produção).
- [x] Commit da fase RED da Fatia 2.
- [x] Implementação da entidade imutável `RefeicaoValidada` (`lib/domain/entities/refeicao_validada.dart`).
- [x] Implementação da interface abstrata de porta `AtletaRepositorio` (`lib/domain/ports/atleta_repositorio.dart`).
- [x] Implementação do serviço puro `BalancoCaloricoService` (`lib/domain/services/balanco_calorico_service.dart`).
- [x] Implementação de repositório In-Memory na camada de infraestrutura (`lib/infrastructure/repositories/atleta_repositorio_in_memory.dart`).
- [x] Execução dos testes e validação da transição para a fase **GREEN** (13/13 testes passando com sucesso).
- [x] Validação estática com `dart analyze` (0 issues).

### [Fatia 3: Integrações Externas, Telemetria & Strava Adapter]
- [ ] Criação dos testes para a entidade `AtividadeStrava` e porta `StravaPort` (Fase RED).
- [ ] Criação dos testes para o cálculo de Saldo Calórico Disponível com treino ($E_{\text{disponível}} = \text{GET} + E_{\text{treino}} - \sum E_{\text{refeições}}$).
- [ ] Implementação de `AtividadeStrava` e `StravaPort`.
- [ ] Implementação de `SaldoDisponivelService` no domínio.
- [ ] Implementação do Circuit Breaker para tolerância a falhas na integração Strava (ADR-11).
- [ ] Adapter Strava REST / Mock Adapter para testes.

### [Fatia 4: Shell Flutter & Edge AI]
- [ ] Shell Flutter UI Web/Mobile.
- [ ] LLM Parser Local & Sync Off-line Bidirecional.

---

## 6. Próximo Passo Pronto para Copiar e Colar (Next Prompt)

```markdown
Inicie a Fatia 3 do FitPulse AI (Integrações Externas, Strava & Balanço com Treino):
1. Crie os testes unitários da Fase RED da Fatia 3 em `test/domain/ports/strava_port_test.dart` e `test/domain/services/saldo_disponivel_service_test.dart`:
   - Teste de `AtividadeStrava` (id, distanciaMetros, duracaoSegundos, gastoCaloricoKcal).
   - Teste da porta `StravaPort` com cenário de sucesso e cenário de falha de conexão (Failure("Erro de Conexão")).
   - Teste do serviço `SaldoDisponivelService` aplicando a fórmula canônica: Saldo = GET + GastoTreino - TotalRefeicoes.
2. Execute os testes comprovando a fase RED da Fatia 3.
3. Atualize o arquivo `GEMINI.md`.
```
