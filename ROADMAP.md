# 📝 FitPulseAI — Visão Geral, Guia de Deploy, APK, Play Store e Monetização

Este documento contém o status completo das funcionalidades do **FitPulseAI**, além dos guias práticos para publicar o app na web, gerar o APK/Android App Bundle (AAB), publicar na Google Play Store e estratégias para monetizá-lo.

---

## ✅ 1. Funcionalidades Implementadas

- [x] **🔐 Autenticação Nativa Mobile & Web**: 
  - Login & Registro com Email/Senha e Google Auth.
  - **Adaptação Nativa Mobile**: Integração com `@codetrix-studio/capacitor-google-auth` no Android (abre a folha nativa do sistema Android sem dependência de browser ou `localhost`).
- [x] **📊 Dashboard & Ring de Calorias**: Meta calórica, consumido, gasto (treinos + Strava) e valor líquido.
- [x] **🥗 Scanner de Refeições com IA (Gemini 2.5/Flash)**: Leitura via foto da refeição ou texto natural.
- [x] **📋 Lista de Refeições de Hoje**: Exibição detalhada no Dashboard e Drawer com opção de **Editar** (nome/macros) e **Excluir**.
- [x] **💧 Water Tracker (Rastreador de Hidratação)**: Anel de progresso, botões rápidos (+150ml, +250ml, +500ml, +1L), histórico de registros do dia e alerta de meta.
- [x] **🔔 Sistema de Toasts (Notificações Globais)**: Feedback visual interativo para todas as ações do usuário (Salvar perfil, registrar comida, conectar Strava, editar/excluir refeição).
- [x] **🚴 Integrador Strava & Seletor de Atividades (Mobile & Web)**:
  - Conexão OAuth adaptada para mobile: redireciona para a URL do servidor de produção (`https://fitpulseai-41d93.web.app/strava/callback`), evitando erros de `localhost` no APK.
  - Modal interativo com seleção múltipla de atividades e soma automática de calorias gastas no dia.
- [x] **🏋️ Módulo de Treinos**: CRUD de treinos por dia da semana, busca de exercícios com database local, cronômetro de treino ativo e timer de descanso interativo.
- [x] **👤 Perfil & Cálculo de Saúde**: IMC, TDEE, BMR (Taxa Metabólica Basal), meta de água sugerida e distribuição recomendada de macros.

---

## 🌐 2. Guia para Disponibilizar o Site Online (Deploy Web)

### Opção A: Firebase Hosting (Recomendado)

#### Passo 1: Instalar Firebase CLI
```powershell
npm install -g firebase-tools
```

#### Passo 2: Fazer Login no Firebase
```powershell
firebase login
```

#### Passo 3: Inicializar o Hosting na pasta do projeto
```powershell
firebase init hosting
```
- Selecione seu projeto Firebase existente (ex: `fitpulseai-41d93`)
- Diretorio público: `dist`
- Configure as single-page app (SPA)? **Yes**
- Automatic builds with GitHub? **No**

#### Passo 4: Fazer Build e Deploy
```powershell
npm run build
firebase deploy --only hosting
```
O Firebase gerará um link público seguro (ex: `https://fitpulseai-41d93.web.app`).

---

### 🔑 Lembrete Importante de Domínio Autorizado
Para que o **Login com Google** e OAuth do Strava funcionem no link público:
1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Authentication** → **Settings** → **Authorized Domains**
3. Clique em **Add Domain** e adicione o seu domínio público (ex: `fitpulseai-41d93.web.app`).

---

## 📱 3. Guia Passo a Passo: Gerar APK para Android (via Capacitor)

O **Capacitor** (desenvolvido pela equipe do Ionic) transforma seu app Web (Vite + React) em um aplicativo Android nativo sem precisar reescrever o código.

### Passo 1: Instalar o Capacitor no Projeto
Na pasta do `FitPulseAI`, execute:
```powershell
npm install @capacitor/core @capacitor/cli @capacitor/android @codetrix-studio/capacitor-google-auth
```

### Passo 2: Inicializar o Capacitor
```powershell
npx cap init FitPulseAI com.fitpulseai.app
```
- **App name**: `FitPulseAI`
- **App Package ID**: `com.fitpulseai.app` (ou o ID da sua empresa/domínio)

### Passo 3: Configurar o `capacitor.config.json`
Certifique-se de que a pasta web apontada seja `dist` e os plugins estejam configurados:
```json
{
  "appId": "com.fitpulseai.app",
  "appName": "FitPulseAI",
  "webDir": "dist",
  "server": {
    "androidScheme": "https",
    "cleartext": true,
    "allowNavigation": [
      "*.firebaseapp.com",
      "*.googleapis.com",
      "*.google.com",
      "accounts.google.com"
    ]
  },
  "plugins": {
    "GoogleAuth": {
      "scopes": ["profile", "email"],
      "serverClientId": "293907355720-kp5enb8cdva15e05bcnv9cvahntj6pem.apps.googleusercontent.com",
      "forceCodeForRefreshToken": true
    }
  }
}
```

### Passo 4: Gerar o Build Web e Adicionar a Plataforma Android
```powershell
npm run build
npx cap add android
```
Isso criará uma pasta nativa `android/` no seu projeto.

### Passo 5: Sincronizar o Código Web com o Android
Sempre que fizer alterações no React/Vite, rode:
```powershell
npm run build
npx cap sync android
```

### Passo 6: Abrir no Android Studio e Gerar o APK / AAB
```powershell
npx cap open android
```
No **Android Studio**:
1. Aguarde a sincronização do Gradle terminar.
2. Para testar em dispositivo ou gerar APK de teste:
   - Vá no menu superior: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
   - O Android Studio gerará o arquivo `app-debug.apk` pronto para instalar no celular.
3. Para publicar na Play Store:
   - Vá em **Build** → **Generate Signed Bundle / APK**.
   - Selecione **Android App Bundle (.aab)**.
   - Crie uma Chave de Assinatura (Keystore) e guarde a senha em local seguro!

---

## 🏪 4. Guia Passo a Passo: Publicar na Google Play Store

### Passo 1: Criar uma Conta de Desenvolvedor no Google Play Console
1. Acesse o [Google Play Console](https://play.google.com/console).
2. Faça login com sua conta Google.
3. Pague a taxa única de registro de **$25 USD** (aprox. R$ 130 a R$ 150).
4. Complete a verificação de identidade (documento oficial com foto e comprovante).

### Passo 2: Criar o Aplicativo no Console
1. Clique em **Criar app**.
2. Preencha:
   - **Nome do app**: `FitPulseAI - Dieta e Treino com IA`
   - **Idioma padrão**: Português (Brasil)
   - **Tipo**: App
   - **Preço**: Gratuito (ou Pago se desejar)

### Passo 3: Configurar a Ficha da Loja (Store Listing)
Preencha as informações essenciais para atração de usuários:
- **Descrição curta (até 80 caracteres)**: *Contador de calorias por IA, rastreador de treino, hidratação e integração Strava.*
- **Descrição completa**: Detalhe os recursos (Scanner Gemini IA, macronutrientes, integração Strava, cronômetro de treinos).
- **Recursos Gráficos Obrigatórios**:
  - Ícone do App: 512x512 px (PNG)
  - Imagem de capa (Feature Graphic): 1024x500 px (PNG/JPG)
  - Screenshots de Celular: Mínimo de 2 capturas de tela (formato 16:9 ou 9:16) do aplicativo em uso.

### Passo 4: Preencher os Questionários Obrigatórios do Google
Na seção **Conteúdo do App**:
1. **Política de Privacidade**: Cole a URL da política de privacidade do app (pode hospedar uma página simples no Firebase Hosting).
2. **Acesso a Apps**: Declarar que todas as funções estão acessíveis com credenciais de teste ou login.
3. **Anúncios**: Informar se o app contém anúncios.
4. **Classificação de Conteúdo**: Preencher o questionário sobre o app (geralmente classificação Livre / 3+ anos).
5. **Público-alvo**: Selecionar 18+ ou Geral.
6. **Segurança dos Dados**: Declarar quais dados são coletados (email para autenticação, dados de saúde/nutrição e treinos).

### Passo 5: Fazer Upload do arquivo `.aab` e Enviar para Análise
1. Vá em **Produção** (ou Teste Fechado) → **Criar nova versão**.
2. Faça o upload do arquivo `.aab` assinado gerado no Android Studio.
3. Escreva as notas da versão (ex: *Lançamento inicial do FitPulseAI!*).
4. Clique em **Salvar** e depois **Revisar e Lançar**.
5. O Google levará entre **1 a 5 dias úteis** para revisar e aprovar o aplicativo na Play Store.

---

## 🚀 5. Lista de Ideias e Melhorias Futuras (Backlog Avançado)

1. **📸 Histórico Fotográfico de Pratos**: Galeria com fotos dos pratos escaneados e datas para comparação visual da dieta.
2. **🤖 Assistente Nutricional / Chat de Voz**: Chatbot Gemini alimentado com o histórico do usuário para dar dicas de substituição de alimentos (ex: *"O que posso comer no jantar com os 40g de carboidratos que me restam?"*).
3. **📊 Exportação em PDF para Nutricionista**: Relatório semanal/mensal formatado com gráficos de adesão a macros e evolução de peso para enviar ao profissional de saúde.
4. **⌚ Integração com Google Fit / Apple Health**: Leitura automática de passos diários, frequência cardíaca e calorias ativas do smartwatch/smartband.
5. **🏆 Gamificação & Conquistas (Badges)**: Medalhas por dias consecutivos batendo a meta de água, semanas concluídas sem estourar calorias e treinos finalizados.
6. **👥 Feed Social / Desafios entre Amigos**: Rankings semanais de hidratação e treinos entre amigos para aumentar o engajamento.

---

## 💰 6. Como Ganhar Dinheiro com o FitPulseAI (Estratégias de Monetização)

### 👑 Estratégia 1: Modelo Freemium com Assinatura Premium (FitPulse PRO)
A melhor e mais rentável estratégia para apps de fitness/saúde.
- **Versão Gratuita**:
  - Scanner de IA limitado a 3 escaneamentos por dia.
  - Registro de treino e água ilimitado.
- **Versão PRO (Assinatura R$ 14,90/mês ou R$ 119,90/ano)**:
  - Scanner de foto por IA ilimitado.
  - Análise profunda de micronutrientes (vitaminas, fibras, sódio).
  - Sugestões de refeição personalizadas por IA com base nas calorias restantes.
  - Exportação de relatórios em PDF.
  - **Como implementar**: Integrar com **RevenueCat** ou **Google Play Billing** no Android.

### 📢 Estratégia 2: Anúncios com Google AdMob
- Exibir banners não intrusivos na parte inferior da tela ou anúncios recompensados (Rewarded Ads).
- Exemplo: *"Assista a um vídeo curto de 15s para desbloquear +3 escaneamentos por IA hoje."*
- **Ganhos**: Varia de R$ 5 a R$ 25 a cada 1.000 visualizações/cliques de anúncios (eCPM em fitness costuma ser alto).

### 🛒 Estratégia 3: Marketing de Afiliados (Suplementos e Equipamentos)
- Na aba de treinos ou scanner, recomendar produtos relevantes:
  - Whey Protein, Creatina, Pré-treino da Growth, Max Titanium, etc.
  - Faixas elásticas, colchonetes, garrafas térmicas.
- **Como implementar**: Cadastrar-se na **Amazon Associados**, **Shopee Afiliados** ou **Lomadee**, gerando links com comissão de 5% a 15% por venda realizada.

### 🩺 Estratégia 4: Parcerias e Marketplace de Nutricionistas / Personal Trainers
- Permitir que nutricionistas e personal trainers se cadastrem na plataforma para acompanhar seus alunos.
- Cobrar uma mensalidade do profissional para usar o dashboard de acompanhamento de alunos.
