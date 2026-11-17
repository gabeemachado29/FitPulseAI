# FitPulse AI — Documento Vivo de Memória e Progresso

**Fonte Única da Verdade (SSOT)**  
Baseado no documento oficial: *"FitPulse AI - Fundação Técnica, Governança e Especificação Canônica v0.1"*  
**Paradigma:** Arquitetura Hexagonal, Functional Core & Local-First Determinístico  
**Stack Primária:** Dart 3.x (Sound Null Safety rigoroso, Record Types, Pattern Matching), Flutter 3.x  

---

## 1. Status do Ciclo TDD
- **Fase Atual:** 🟢 **GREEN** (Transitando para 🔵 **REFACTOR**)
- **Fatia em Execução:** **Fatia 1: Core Puramente Funcional (Motor Metabólico TMB/GET + Macronutrientes)**
- **Testes Canônicos Concluídos:** T1 a T6 (6/6 passando, 0 erros no `dart analyze`).
  - T1, T2, T3: `test/domain/services/metabolismo_test.dart` (TMB e GET)
  - T4, T5, T6: `test/domain/value_objects/macronutrientes_test.dart` (Macronutrientes e Result)
- **Próximo Passo:** Refactor da Fatia 1 (lints estritos, `analysis_options.yaml`) e então iniciar Fatia 2.

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
- **ADR-12 (Tipagem Enumerada de Atividade):** Fatores de atividade física acoplados aos enums (`sedentario: 1.2`, `levementeAtivo: 1.375`, `moderadamenteAtivo: 1.55`, `muitoAtivo: 1.725`, `extremamenteAtivo: 1.9`).
- **ADR-13 (Armazenamento de Macros com Decimais):** Representação interna de massa em `double` de precisão.
- **ADR-14 (DomainError Tipado):** Erros de domínio representados por `enum DomainError` para exaustividade no `switch`.
- **ADR-16 (Testes Unitários Sem Mocks no Core):** Testes diretos sobre entidades puras e funções determinísticas.

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
    ├── services/
    │   └── metabolismo_test.dart       # Testes T1, T2 e T3 (GREEN ✅)
    └── value_objects/
        └── macronutrientes_test.dart   # Testes T4, T5 e T6 (GREEN ✅)
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
- [x] Suíte completa: 6/6 testes passando. Análise estática: 0 issues.
- [ ] Refactor e aplicação de lints estritos (`analysis_options.yaml`).

### [Fatia 2: Mapeamento de Portas & Repositório In-Memory]
- [ ] Implementação da entidade `RefeicaoValidada` (T7).
- [ ] Definição da porta `StravaPort` e teste T8.
- [ ] Implementação do Algoritmo Calórico de balanço com treinos (T9).
- [ ] Teste canônico do fluxo monadic fold (T10).
- [ ] Implementação dos Repositórios In-Memory.

### [Fatia 3: Adaptadores de Persistência Local & Strava]
- [ ] Adapter IndexedDB / SQLite.
- [ ] Strava REST Client com Circuit Breaker.

### [Fatia 4: Shell Flutter & Edge AI]
- [ ] Shell Flutter UI Web/Mobile.
- [ ] LLM Parser Local & Sync Off-line Bidirecional.

---

## 6. Próximo Passo Pronto para Copiar e Colar (Next Prompt)

```markdown
Finalize a Fatia 1 do FitPulse AI com a fase REFACTOR e inicie a Fatia 2:
1. Crie `analysis_options.yaml` com lints estritos (strict-casts, strict-inference, strict-raw-types) e confirme `dart analyze` limpo.
2. Inicie a Fatia 2 criando a suíte de testes canônicos T7 a T10 em arquivos separados:
   - T7: Entidade `RefeicaoValidada` com lista de Macronutrientes -> totalCalorico correto.
   - T8: Porta `AtletaRepositorio` (interface abstrata) com `salvar` e `buscarPorId` retornando Result.
   - T9: Serviço `BalancoCaloricoService` calcula deficit/superávit calórico = GET - totalIngerido.
   - T10: Fluxo monadic completo com `fold` sobre o Result de buscar atleta e calcular balanço.
3. Execute os testes para comprovar a fase RED da Fatia 2.
4. Atualize o arquivo `GEMINI.md`.
```
