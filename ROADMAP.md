# 📝 FitPulseAI — Visão Geral, Status do Projeto, Deploy, APK, Play Store & Monetização

Este documento contém o mapa completo e atualizado de todas as funcionalidades do **FitPulseAI**, status do projeto, guias práticos para deploy na web, geração de APK/AAB para Android, publicação na Google Play Store e estratégias de monetização.

---

## ⚡ Status Atual do Projeto: **100% Concluído & Pronto para Produção (1.973 Módulos)**

---

## ✅ 1. Funcionalidades Implementadas

### 🔐 1.1 Autenticação & Conformidade (LGPD)
- [x] **Autenticação Nativa Mobile & Web**: Login & Registro com Email/Senha e Google OAuth.
- [x] **Integração Nativa Android**: Suporte a `@codetrix-studio/capacitor-google-auth` para acionar a folha nativa do sistema no Android.
- [x] **Redefinição de Senha**: Fluxo "Esqueceu a senha?" com disparo de e-mail seguro via Firebase Auth.
- [x] **Validador de Senha Forte**: Indicador visual em tempo real (mínimo 8 caracteres, maiúsculas, números).
- [x] **Termos de Uso & Política de Privacidade**: Páginas legais (`/terms` e `/privacy`) exigidas pela Google Play Store e LGPD.
- [x] **Exclusão Permanente de Conta (LGPD)**: Modal de confirmação dupla (`EXCLUIR`) que deleta de forma irreversível os dados do Firestore e a conta Firebase Auth.

---

### 🥗 1.2 Scanner de Refeições com IA (Google Gemini 2.5 Flash)
- [x] **Análise Multimodal por Foto e Texto**: Leitura de pratos através de foto da câmera/galeria ou descrição textual em português.
- [x] **Compressão Inteligente de Imagem**: Canvas API comprime fotos de 5-10MB para ~200KB antes de enviar, evitando timeouts.
- [x] **Prompts Profissionais em PT-BR**: Atuação como nutricionista esportivo usando tabelas TACO e USDA.
- [x] **Detalhamento Alimento por Alimento**: Tabela expansível exibindo a porção estimada e macros individuais de cada ingrediente do prato.
- [x] **Badge de Nível de Confiança**: Indicador visual (Confiança **Alta** ✅ / **Média** ⚠️ / **Baixa** ❓).
- [x] **Resiliência & Retry**: Mecanismo de re-tentativa com backoff exponencial e mensagens de erro amigáveis.

---

### 📊 1.3 Dashboard & Gestão Nutricional
- [x] **Navegação Temporal**: Seletor de data (`◀ Hoje ▶`) para consultar registros passados e futuros.
- [x] **Anel Circular de Progresso**: Meta calórica, consumido, gasto (treinos + Strava) e calorias restantes.
- [x] **Lista Interativa de Refeições**: Exibição detalhada de alimentos do dia com opção de **Editar** (nome/macros) e **Excluir**.
- [x] **Drawer "Detalhes de Nutrição"**: Barras de progresso para Proteína, Carboidratos e Gordura, gráfico semanal e estatísticas.
- [x] **Water Tracker (Hidratação)**: Anel de progresso, botões rápidos (+150ml, +250ml, +500ml, +1L), histórico e meta dinâmica por peso.
- [x] **Gráfico de Evolução Semanal**: Barras interativas do consumo calórico dos últimos 7 dias.

---

### 🏋️ 1.4 Módulo de Treinos & Integração Strava
- [x] **CRUD Completo de Treinos**: Organização por dia da semana (`Seg` a `Dom`).
- [x] **Base com 35+ Exercícios**: Busca em tempo real por nome ou grupo muscular.
- [x] **Interface de Sessão Ativa**: Cronômetro de treino, contador de carga/séries e estimativa de calorias gastas.
- [x] **Timer de Descanso Interativo (`RestTimer`)**: Fundo teal animado, aviso da próxima série, botões `+15s` e `▶ Pular`.
- [x] **Integrador Strava (Multi-Client)**: Fluxo OAuth com isolamento por usuário (`users/{uid}/integrations/strava`), suporte anti-CSRF e modal de seleção múltipla de atividades para somar calorias.

---

### 📸 1.5 Galeria de Histórico Fotográfico (`/history`)
- [x] **Histórico de Pratos por Foto**: Grade de fotos estilo galeria com datas e marcas de calorias.
- [x] **Modal de Inspeção Visual**: Zoom no prato com exibição detalhada de macros, porções e data/hora.

---

### 🤖 1.6 Assistente Nutricional com IA (`/chat`)
- [x] **Chatbot Gemini 2.5 Flash**: Injeção de contexto em tempo real (perfil, consumo do dia, calorias e macros que restam).
- [x] **Sugestões Rápidas de Alimentos**: Chips interativos (*"O que comer no jantar?"*, *"Como bater meta de proteína?"*).
- [x] **5ª Tab no BottomNav**: Atalho direto para o chat de IA na barra inferior.

---

### 📊 1.7 Exportação em PDF para Nutricionista (`/report`)
- [x] **Gerador de Relatórios Profissionais**: Resumo do perfil, médias de calorias e macros e tabela detalhada.
- [x] **Pronto para Impressão / PDF**: Interface com suporte a `window.print()` e formatação CSS `@media print`.

---

### ⌚ 1.8 Smartwatch & Health Connect
- [x] **Widget de Saúde no Dashboard**: Monitoramento de passos 🚶, frequência cardíaca ❤️ e calorias ativas 🔥.
- [x] **Suporte a Google Fit & Apple Health**: Modal de seleção e sincronização de dados.

---

### 🏆 1.9 Gamificação & Conquistas (Badges)
- [x] **Sistema de Medalhas**: Badges por conquistas (*Primeiro Passo 🌟*, *Hidratação Perfeita 💧*, *Mestre do Scanner 📸*, *Foco Total 🔥*).
- [x] **Painel de Conquistas no Perfil**: Progresso visual das medalhas bloqueadas e desbloqueadas.

---

### 👥 1.10 Feed Social & Desafios da Comunidade (`/social`)
- [x] **Ranking Semanal de Amigos**: Tabela de classificação baseada em hidratação e treinos com medalhas (🥇, 🥈, 🥉).
- [x] **Desafios da Comunidade**: Participação em desafios coletivos de água e treinos.
- [x] **Sistema de Solicitação de Amigos**: Adicionar amigos via e-mail.

---

## 🌐 2. Guia de Deploy Web (Firebase Hosting)

### Passo 1: Instalar Firebase CLI
```powershell
npm install -g firebase-tools
```

### Passo 2: Login no Firebase
```powershell
firebase login
```

### Passo 3: Inicializar o Hosting na pasta do projeto
```powershell
firebase init hosting
```
- Projeto: `fitpulseai-41d93`
- Diretorio público: `dist`
- Configure as single-page app (SPA)? **Yes**
- Automatic builds with GitHub? **No**

### Passo 4: Build e Deploy
```powershell
npm run build
firebase deploy --only hosting
```
O link público gerado será: `https://fitpulseai-41d93.web.app`

---

## 📱 3. Guia Passo a Passo: Gerar APK / AAB para Android (Capacitor)

### Passo 1: Instalar o Capacitor
```powershell
npm install @capacitor/core @capacitor/cli @capacitor/android @codetrix-studio/capacitor-google-auth
```

### Passo 2: Sincronizar o Código Web com o Android
```powershell
npm run build
npx cap sync android
```

### Passo 3: Abrir no Android Studio
```powershell
npx cap open android
```

### Passo 4: Gerar APK ou AAB Assinado
- Para testar no celular: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
- Para publicar na Play Store: **Build** → **Generate Signed Bundle / APK** → **Android App Bundle (.aab)**.

---

## 🏪 4. Guia Passo a Passo: Publicar na Google Play Store

1. **Conta de Desenvolvedor**: Acesse o [Google Play Console](https://play.google.com/console) e pague a taxa única de **$25 USD**.
2. **Criar o App**: Nome `FitPulseAI - Dieta e Treino com IA`, idioma Português (Brasil).
3. **Ficha da Loja (Store Listing)**:
   - Descrição curta (até 80 chars): *Contador de calorias por IA, treino, hidratação e integração Strava.*
   - Recursos gráficos: Ícone 512x512, Feature Graphic 1024x500 e Screenshots do celular.
4. **Questionários Obrigatórios**:
   - Política de Privacidade: URL da página `/privacy` (ex: `https://fitpulseai-41d93.web.app/privacy`).
   - Segurança de Dados: Declarar dados de autenticação e métricas de saúde.
5. **Upload e Análise**: Fazer upload do arquivo `.aab` assinado e enviar para análise do Google (1 a 5 dias úteis).

---

## 💰 5. Estratégias de Monetização

### 👑 Estratégia 1: Modelo Freemium (FitPulse PRO)
- **Versão Gratuita**: 3 escaneamentos de IA por dia, treinos e água ilimitados.
- **Versão PRO (R$ 14,90/mês ou R$ 119,90/ano)**:
  - Scanner de foto por IA ilimitado.
  - Chatbot assistente de IA ilimitado.
  - Exportação de relatórios em PDF.
  - Análise de micronutrientes avançada.

### 📢 Estratégia 2: Anúncios com Google AdMob
- Banners discretos e vídeos recompensados (*"Assista 15s para desbloquear +3 leituras de IA"*).

### 🛒 Estratégia 3: Marketing de Afiliados Fitness
- Recomendações de Whey Protein, Creatina e equipamentos esportivos via **Amazon Associados** e **Shopee Afiliados**.
