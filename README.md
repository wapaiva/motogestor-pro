# 🏍️ MotoGestor Pro

> **Sistema inteligente de gestão financeira para motoboys e entregadores de aplicativos, focado em controle de ganhos, corridas e performance diária.**

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Fluxo de Autenticação](#fluxo-de-autenticação)
- [Sistema de Armazenamento](#sistema-de-armazenamento)
- [Sistema de Gamificação](#sistema-de-gamificação)
- [Publicação na Play Store](#publicação-na-play-store)
- [Contribuição](#contribuição)
- [Autor](#autor)

---

## 📖 Sobre o Projeto

O **MotoGestor Pro** é uma Progressive Web App (PWA) desenvolvida especialmente para motoboys e entregadores de aplicativo que precisam de controle financeiro detalhado da sua operação diária.

Com o MotoGestor Pro, o profissional consegue registrar corridas, controlar gastos com combustível e manutenção, visualizar relatórios de desempenho, comparar plataformas de delivery e acompanhar sua evolução através de um sistema de conquistas gamificado.

### 🎯 Problema que Resolve

Motoboys e entregadores geralmente trabalham em múltiplas plataformas (Uber, 99, iFood, Rappi, etc.) e têm dificuldade em saber ao final do dia, semana ou mês quanto realmente lucraram após descontar combustível, manutenção e outros custos. O MotoGestor Pro centraliza tudo isso em um único aplicativo, com visual limpo e intuitivo, otimizado para uso no celular.

---

## ✨ Funcionalidades

### 🏠 Dashboard
- Resumo financeiro com visão de hoje, semana, mês e trimestre
- Cards de estatísticas: ganhos totais, gastos, lucro líquido, km rodados e média por corrida
- Gráficos de barras e pizza com distribuição de ganhos e gastos
- Progress bar de metas diárias, semanais e mensais
- Smart Insights com análises automáticas e dicas personalizadas
- Indicador de nível e MTG do sistema de gamificação

### 🏍️ Corridas
- Registro de corridas com data, valor, distância, tipo e plataforma
- Suporte a múltiplas plataformas: Uber, 99, iFood, Rappi, UaiRango, MotoSJ, Pedemoto, Particular e outras
- Histórico completo com opção de exclusão
- Validação para exigir cadastro da moto antes do primeiro registro
- Som de buzina ao registrar corrida com sucesso

### 💸 Gastos
- **Combustível:** registro com data, valor, litros abastecidos, odômetro, tipo (gasolina/etanol) e posto
- **Manutenção:** registro de óleo, pneu, freio, corrente, revisão, elétrica e outros
- **Extras:** multas, seguro, documentação, IPVA, lavagem, alimentação e outros

### 📊 Relatórios
- Visão por período: hoje, semana e mês
- Gráficos de ganhos por tipo de serviço
- Gráfico de distribuição de gastos (pizza)
- Gráfico de área de evolução dos ganhos nos últimos 6 meses
- Exportação e compartilhamento de relatório em texto
- Cálculo automático de lucro líquido e margem

### 👤 Perfil
- Dados do profissional: nome, cidade, tipo de serviço
- Dados da moto: modelo, ano, placa, quilometragem atual e consumo médio esperado
- Configuração de metas: diária, semanal e mensal
- Tema claro/escuro

### 🏆 Conquistas (Gamificação)
- Sistema de MTG e níveis com títulos progressivos
- 15 badges desbloqueáveis em 4 categorias: corridas, ganhos, economia e dedicação
- Streak de dias consecutivos trabalhados
- Exemplos: "Primeira Corrida", "Lenda das Ruas" (100 corridas), "Magnata do Delivery" (R$ 50k)

### 🔗 Integrações
- Configuração de integração com plataformas de delivery
- Comparação de desempenho entre apps

### 🔒 Autenticação
- Login com e-mail e senha via Firebase Auth
- Login com Google (OAuth)
- Cadastro de novos usuários
- Rota protegida: usuário não autenticado é redirecionado para login
- Tela de splash screen animada na abertura

### 📜 Páginas Legais
- Termos de Uso
- Política de Privacidade
- Política de Cookies
- Dialog de consentimento LGPD na primeira abertura

---

## 🛠️ Tecnologias Utilizadas

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| Framework | React | 18.3 |
| Linguagem | TypeScript | 5.8 |
| Build Tool | Vite | 5.4 |
| Estilização | Tailwind CSS | 3.4 |
| Componentes UI | shadcn/ui + Radix UI | — |
| Roteamento | React Router DOM | 6.30 |
| Gráficos | Recharts | 3.8 |
| Autenticação | Firebase Auth | 12 |
| Formulários | React Hook Form + Zod | — |
| Estado/Cache | TanStack React Query | 5 |
| Notificações | Sonner | 1.7 |
| Datas | date-fns | 3.6 |
| Ícones | Lucide React | 0.462 |
| Testes | Vitest + Testing Library | — |
| Linter | ESLint | 9 |

---

## 🏗️ Arquitetura do Projeto

O MotoGestor Pro segue uma arquitetura de SPA (Single Page Application) com as seguintes camadas:

```
┌─────────────────────────────────────────┐
│             Camada de Apresentação      │
│  Pages: Dashboard, Rides, Expenses,     │
│  Reports, Profile, Gamification...      │
├─────────────────────────────────────────┤
│            Camada de Componentes        │
│  UI: shadcn/ui, BottomNav, StatCard,    │
│  SmartInsights, SplashScreen...         │
├─────────────────────────────────────────┤
│             Camada de Lógica            │
│  Libs: storage, gamification,           │
│  firebase, sounds, theme, utils         │
├─────────────────────────────────────────┤
│           Camada de Persistência        │
│  localStorage (dados locais do usuário) │
│  Firebase Auth (autenticação)           │
└─────────────────────────────────────────┘
```

**Padrão de armazenamento:** todos os dados de corridas, gastos, manutenção e perfil são armazenados localmente no dispositivo via `localStorage`, garantindo funcionamento offline. A autenticação é gerenciada pelo Firebase.

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) >= 18.x
- [npm](https://www.npmjs.com/) >= 9.x (ou [bun](https://bun.sh/))
- [Git](https://git-scm.com/)
- Uma conta no [Firebase](https://firebase.google.com/) (gratuita)
- Uma conta de desenvolvedor na [Google Play Console](https://play.google.com/console) (paga, taxa única de US$ 25)

---

## ⚙️ Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/wapaiva/motogestor-pro.git
cd motogestor-pro
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto (veja a seção [Variáveis de Ambiente](#variáveis-de-ambiente)).

### 4. Execute em modo de desenvolvimento

```bash
npm run dev
```

O app ficará disponível em `http://localhost:8080`.

---

## 🔑 Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto com as seguintes variáveis do seu projeto Firebase:

```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

> ⚠️ **Importante:** Nunca commite o arquivo `.env` no repositório. Ele já está listado no `.gitignore`.

Para obter essas credenciais, acesse o [Console do Firebase](https://console.firebase.google.com/), crie um projeto, adicione um app Web e copie as configurações exibidas.

---

## 📜 Scripts Disponíveis

```bash
# Inicia o servidor de desenvolvimento
npm run dev

# Gera o build de produção (pasta /dist)
npm run build

# Pré-visualiza o build de produção localmente
npm run preview

# Executa o linter ESLint
npm run lint

# Executa os testes unitários
npm run test

# Executa os testes em modo watch (desenvolvimento)
npm run test:watch
```

---

## 📁 Estrutura de Pastas

```
motogestor-pro/
├── public/
│   ├── icons/
│   │   ├── icon-192.png        # Ícone PWA 192x192
│   │   └── icon-512.png        # Ícone PWA 512x512
│   ├── sounds/
│   │   ├── moto_horn.mp3       # Som de buzina
│   │   └── moto_start.mp3      # Som de motor
│   ├── manifest.json           # Manifesto PWA
│   └── robots.txt
├── src/
│   ├── assets/
│   │   └── logo-motogestor.png # Logo do app
│   ├── components/
│   │   ├── ui/                 # Componentes base (shadcn/ui)
│   │   ├── BottomNav.tsx       # Navegação inferior
│   │   ├── ConsentDialog.tsx   # Dialog LGPD
│   │   ├── NavLink.tsx         # Link de navegação
│   │   ├── Onboarding.tsx      # Tela de boas-vindas
│   │   ├── ProtectedRoute.tsx  # Guard de autenticação
│   │   ├── SmartInsights.tsx   # Análises inteligentes
│   │   ├── SourceSelect.tsx    # Seletor de plataforma
│   │   ├── SplashScreen.tsx    # Tela de abertura
│   │   ├── StatCard.tsx        # Card de estatística
│   │   └── ThemeToggle.tsx     # Alternador de tema
│   ├── hooks/
│   │   ├── use-mobile.tsx      # Hook de detecção mobile
│   │   └── use-toast.ts        # Hook de notificações
│   ├── lib/
│   │   ├── firebase.ts         # Configuração Firebase Auth
│   │   ├── gamification.ts     # Lógica de MTG e badges
│   │   ├── notifications.ts    # Notificações push
│   │   ├── sounds.ts           # Reprodução de sons
│   │   ├── storage.ts          # CRUD localStorage
│   │   ├── theme.ts            # Gerenciamento de tema
│   │   └── utils.ts            # Utilitários gerais
│   ├── pages/
│   │   ├── Dashboard.tsx       # Painel principal
│   │   ├── Rides.tsx           # Registro de corridas
│   │   ├── Expenses.tsx        # Registro de gastos
│   │   ├── Reports.tsx         # Relatórios e gráficos
│   │   ├── Profile.tsx         # Perfil do usuário
│   │   ├── Gamification.tsx    # Conquistas e badges
│   │   ├── Integrations.tsx    # Integrações
│   │   ├── CompareApps.tsx     # Comparação de apps
│   │   ├── Login.tsx           # Autenticação
│   │   ├── TermsOfUse.tsx      # Termos de uso
│   │   ├── PrivacyPolicy.tsx   # Política de privacidade
│   │   ├── CookiePolicy.tsx    # Política de cookies
│   │   └── NotFound.tsx        # Página 404
│   ├── types/
│   │   └── ride.ts             # Tipos TypeScript
│   ├── test/
│   │   ├── example.test.ts     # Teste de exemplo
│   │   └── setup.ts            # Configuração de testes
│   ├── App.tsx                 # Componente raiz + rotas
│   ├── main.tsx                # Entry point
│   ├── App.css                 # Estilos globais
│   └── index.css               # Variáveis CSS / Tailwind
├── .gitignore
├── .env                        # (não versionado) Variáveis de ambiente
├── components.json             # Configuração shadcn/ui
├── eslint.config.js            # Configuração ESLint
├── index.html                  # HTML base do app
├── package.json                # Dependências e scripts
├── postcss.config.js           # Configuração PostCSS
├── tailwind.config.ts          # Configuração Tailwind
├── tsconfig.json               # Configuração TypeScript
├── vite.config.ts              # Configuração Vite
└── vitest.config.ts            # Configuração Vitest
```

---

## 🔐 Fluxo de Autenticação

```
Abertura do App
      │
      ▼
SplashScreen (animação 2s)
      │
      ▼
Usuário autenticado? ──── NÃO ──▶ Redireciona para /login
      │                                     │
     SIM                         Login Email/Google
      │                                     │
      ▼                                     ▼
ConsentDialog (1ª vez)         Firebase Auth valida
      │                                     │
      ▼                                     ▼
Onboarding (1ª vez)            Salva sessão local
      │                                     │
      ▼                                     ▼
Dashboard                          Dashboard
```

O `ProtectedRoute` garante que rotas privadas só sejam acessadas por usuários autenticados, redirecionando automaticamente para `/login` caso contrário.

---

## 💾 Sistema de Armazenamento

Os dados são persistidos no `localStorage` do dispositivo com as seguintes chaves:

| Chave | Descrição | Tipo |
|-------|-----------|------|
| `mg_rides` | Histórico de corridas | `Ride[]` |
| `mg_fuel` | Registros de combustível | `FuelEntry[]` |
| `mg_maintenance` | Registros de manutenção | `MaintenanceEntry[]` |
| `mg_expenses` | Gastos extras | `Expense[]` |
| `mg_profile` | Perfil do usuário | `UserProfile` |
| `mg_goals` | Metas financeiras | `Goals` |

> 💡 O armazenamento local garante funcionamento **offline** e **sem custos de backend** para o usuário.

---

## 🏆 Sistema de Gamificação

O sistema de gamificação engaja o usuário com MTG, níveis e badges:

### Ganho de MTG
- **+10 MTG** por corrida registrada
- **+5 MTG** a cada R$ 100 ganhos
- **+50 MTG** por badge desbloqueado

### Níveis e Títulos
| Nível | Título |
|-------|--------|
| 1 | Iniciante |
| 2 | Aprendiz |
| 3 | Piloto |
| 4 | Veterano |
| 5+ | Mestre / Elite |

### Badges Disponíveis (15 no total)

**Corridas:** Primeira Corrida, Esquentando Motor (10), Piloto Experiente (50), Lenda das Ruas (100), Ás do Asfalto (500)

**Ganhos:** Primeiro Milhar, Conta Turbinada (R$5k), Dez Mil!, Magnata do Delivery (R$50k)

**Economia:** Econômico, Mestre do Lucro

**Dedicação:** Semana Firme (7 dias), Mês Completo (30 dias), Madrugador, Coruja Noturna

---

## 📱 Publicação na Play Store

Consulte o arquivo **[GUIA-PUBLICACAO-PLAY-STORE.md](./GUIA-PUBLICACAO-PLAY-STORE.md)** para o passo a passo completo e detalhado de como publicar o MotoGestor Pro na Google Play Store usando o Bubblewrap/PWA Builder.

---

## 👨‍💻 Autor

**WC Tech Labs**

- GitHub: [@wapaiva]([https://github.com/wapaiva])
- E-mail: wctechlabs@gmail.com

---

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados © 2026 WC Tech Labs.

---

* 🏍️ Feito para a comunidade de motoboys e entregadores do Brasil 🇧🇷*
