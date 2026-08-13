# 📝 FitPulseAI — Observações, Backlog Futuro e Guia de Deploy Público

Este documento registra todas as observações levantadas para implementação em ciclos futuros, bem como o guia passo-a-passo para colocar o projeto no ar via link público para testes.

---

## 📌 1. Melhorias e Funcionalidades para Próximas Fases (Backlog)

### 💧 1.1 Contador / Rastreador de Água (Water Tracker)
- **Objetivo**: Permitir que o usuário registre o consumo de água ao longo do dia (ex: botões de +250ml, +500ml ou valor personalizado).
- **Integração**: Exibir uma barra/anel de progresso de hidratação na tela inicial comparando com a meta de hidratação do perfil (ex: `1500 / 4025 ml`).
- **Persistência**: Armazenar os registros de hidratação por data no Firestore (`users/{uid}/waterLogs/{date}`).

### 🔔 1.2 Sistema de Notificações / Toast Feedbacks
- **Objetivo**: Exibir mensagens visuais interativas (Toast / Banner) para confirmação de ações.
- **Eventos**:
  - Confirmação de registro de alimento/refeição via Scanner ou formulário.
  - Confirmação de salvamento e alteração de perfil.
  - Alertas de conquista de meta diária de calorias ou treino concluído.
- **Componente**: Implementar um `ToastContainer` com animação slide-in e auto-dismiss (3 segundos).

### 🚴 1.3 Seletor Interativo de Atividades do Strava
- **Objetivo**: Ao clicar em "Puxar atividade do Strava", exibir um modal com a lista de atividades recentes importadas para o usuário escolher qual deseja aplicar.
- **Comportamento**:
  - O usuário seleciona 1 ou mais atividades (ex: Corrida matinal de 320 kcal).
  - As calorias das atividades selecionadas são somadas ao **Gasto Calórico do Dia (Burned Calories)** no Dashboard.
  - O valor líquido de calorias do dia é recalculado automaticamente: `Calorias Líquidas = Consumido - Gasto (Treino + Strava)`.

---

## 🌐 2. Guia para Disponibilizar o Site Online (Deploy Público)

Para disponibilizar o aplicativo para qualquer pessoa com o link experimentar, recomendamos o **Firebase Hosting** (gratuito e integrado ao seu projeto Firebase atual) ou **Vercel**.

### Opção A: Firebase Hosting (Recomendado)

#### Passo 1: Instalar o Firebase CLI (caso não tenha)
```powershell
npm install -g firebase-tools
```

#### Passo 2: Fazer Login no Firebase
```powershell
firebase login
```

#### Passo 3: Inicializar o Hosting no Projeto
Na raiz da pasta `FitPulseAI`:
```powershell
firebase init hosting
```
- Selecione seu projeto: `fitpulseai-41d93`
- Qual pasta usar como public directory? Escreva: `dist`
- Configure as a single-page app (rewrite all urls to /index.html)? Responda: **Yes**
- Set up automatic builds with GitHub? Responda: **No**

#### Passo 4: Fazer o Build e Deploy
```powershell
npm run build
firebase deploy --only hosting
```

Após o comando, o Firebase gerará um link público instantâneo (ex: `https://fitpulseai-41d93.web.app`).

---

### Opção B: Vercel (Deploy em 1 Minuto)

1. Instale o CLI da Vercel:
```powershell
npm install -g vercel
```
2. Execute:
```powershell
vercel
```
3. Siga as instruções no terminal (aceite os padrões). O link público `.vercel.app` será gerado automaticamente.

---

### 🔑 Lembrete Importante de Domínio Autorizado no Firebase
Para que o **Login com Google** funcione no link público gerado:
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Authentication** → **Settings** (Configurações) → **Authorized Domains** (Domínios autorizados)
3. Clique em **"Add Domain"** e adicione o seu domínio público (ex: `fitpulseai-41d93.web.app` ou seu link da Vercel).
