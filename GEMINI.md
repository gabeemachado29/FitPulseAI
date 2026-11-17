# FitPulse AI — Documento Vivo de Memória e Progresso

**Fonte Única da Verdade (SSOT)**  
Baseado no documento oficial: *"FitPulse AI - Fundação Técnica, Governança e Especificação Canônica v0.1"*  
**Paradigma:** Arquitetura Hexagonal, Functional Core & Local-First Determinístico  
**Stack Primária:** Dart 3.x (Sound Null Safety rigoroso, Record Types, Pattern Matching), Flutter 3.x  

---

## 1. Status do Ciclo TDD
- **Fase Atual:** 🔴 **RED**
- **Fatia em Execução:** **Fatia 2: Mapeamento de Portas, Entidades Secundárias & Repositório In-Memory**
- **Testes da Fatia Concluída (Fatia 1):** T1 a T6 (6/6 passando, 0 erros com lints estritos).
- **Testes em Fase RED (Fatia 2):** T7 a T10 (4/4 falhando por ausência de código de produção):
  - T7: `test/domain/entities/refeicao_validada_test.dart` (RefeicaoValidada e totalCalorico)
  - T8: `test/domain/ports/atleta_repositorio_test.dart` (Interface AtletaRepositorio)
  - T9: `test/domain/services/balanco_calorico_service_test.dart` (BalancoCaloricoService)
  - T10: `test/domain/services/fluxo_monadic_test.dart` (Fluxo Monadic fold e encadeamento)

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
│   │   └── atleta.dart      # Entidade Atleta, SexoBiologico e NivelAtividade
│   ├── value_objects/       
│   │   ├── result.dart      # Mônada Result<S, F> (sealed class: Success, Failure)
│   │   └── macronutrientes.dart  # Value Object Macronutrientes + DomainError
│   ├── services/            # Serviços de cálculo e domínio
│   └── ports/               # Portas de comunicação
├── infrastructure/          # Adapters (Strava, IndexedDB, SQLite, Repos In-Memory)
└── presentation/            # UI Shell (Flutter)

test/
└── domain/
    ├── entities/
    │   └── refeicao_validada_test.dart        # Teste T7 (RED 🔴)
    ├── ports/
    │   └── atleta_repositorio_test.dart       # Teste T8 (RED 🔴)
    ├── services/
    │   ├── metabolismo_test.dart              # Testes T1, T2 e T3 (GREEN ✅)
    │   ├── balanco_calorico_service_test.dart # Teste T9 (RED 🔴)
    │   └── fluxo_monadic_test.dart            # Teste T10 (RED 🔴)
    └── value_objects/
        └── macronutrientes_test.dart          # Testes T4, T5 e T6 (GREEN ✅)
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
- [ ] Implementação da entidade imutável `RefeicaoValidada` (`lib/domain/entities/refeicao_validada.dart`).
- [ ] Implementação da interface abstrata de porta `AtletaRepositorio` (`lib/domain/ports/atleta_repositorio.dart`).
- [ ] Implementação do serviço puro `BalancoCaloricoService` (`lib/domain/services/balanco_calorico_service.dart`).
- [ ] Execução dos testes e validação da transição para a fase **GREEN** (T7 a T10 passando, suíte completa 10/10).
- [ ] Validação estática com `dart analyze` (0 issues).
- [ ] Implementação de repositório In-Memory na camada de infraestrutura (`lib/infrastructure/repositories/atleta_repositorio_in_memory.dart`).

### [Fatia 3: Adaptadores de Persistência Local & Strava]
- [ ] Adapter IndexedDB / SQLite.
- [ ] Strava REST Client com Circuit Breaker.

### [Fatia 4: Shell Flutter & Edge AI]
- [ ] Shell Flutter UI Web/Mobile.
- [ ] LLM Parser Local & Sync Off-line Bidirecional.

---

## 6. Próximo Passo Pronto para Copiar e Colar (Next Prompt)

```markdown
Transicione a Fatia 2 do FitPulse AI da fase RED para a fase GREEN:
1. Crie `lib/domain/entities/refeicao_validada.dart` com:
   - Classe imutável `RefeicaoValidada` (id, descricao, itens: List<Macronutrientes>)
   - Getter `double get totalCalorico` somando as caloriasTotais de todos os itens.
2. Crie `lib/domain/ports/atleta_repositorio.dart` com:
   - `abstract interface class AtletaRepositorio` definindo `salvar(Atleta atleta)` e `buscarPorId(String id)` retornando `Result`.
3. Crie `lib/domain/services/balanco_calorico_service.dart` com:
   - `BalancoCaloricoService.calcular({required double gastoEnergeticoTotal, required double totalIngerido})`.
4. Execute todos os testes unitários (T1 a T10) comprovando que todos os 10 testes passam com sucesso.
5. Execute `dart analyze` garantindo 0 warnings/erros.
6. Faça o commit e atualize o arquivo `GEMINI.md`.
```
