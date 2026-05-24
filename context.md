# Contexto do Projeto FleetControl

## 📋 Visão Geral

**FleetControl** é uma aplicação web de gerenciamento de frotas de caminhões construída com Next.js 16, React 19 e TypeScript. O projeto oferece um dashboard completo para monitoramento de viagens, gestão de veículos (caminhões) e análise de custos com relatórios detalhados.

**Workspace:** `c:\Users\caios\Documents\fleetcontrol`  
**Data:** 13 de maio de 2026

---

## 🔧 Stack Tecnológico

### Framework & Core
- **Next.js:** `^16.2.4` (App Router)
- **React:** `^19`
- **React DOM:** `^19`
- **TypeScript:** `5.7.3` (strict mode)
- **Node.js:** Suportado por `.next/` e configuração Next.js

### Styling
- **Tailwind CSS:** `^4.2.0`
- **@tailwindcss/postcss:** `^4.2.0`
- **PostCSS:** `^8.5`
- **autoprefixer:** `^10.4.20`

### UI & Components
- **@radix-ui:** Componentes headless (accordion, alert-dialog, avatar, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toggle, toggle-group, tooltip)
- **lucide-react:** `^0.564.0` (ícones)
- **recharts:** `2.15.0` (gráficos)
- **react-day-picker:** `9.13.2` (calendários)
- **cmdk:** `1.1.1` (command palette)
- **embla-carousel-react:** `8.6.0` (carrosséis)
- **sonner:** `^1.7.1` (notificações toast)

### Formulários & Validação
- **react-hook-form:** `^7.54.1`
- **@hookform/resolvers:** `^3.9.1`
- **zod:** `^3.24.1` (validação de schema)

### Integração & Backend
- **@supabase/ssr:** `^0.10.2` (autenticação e banco de dados)
- **@vercel/analytics:** `1.6.1` (métricas)

### Utilidades
- **class-variance-authority:** `^0.7.1`
- **clsx:** `^2.1.1`
- **tailwind-merge:** `^3.3.1`
- **next-themes:** `^0.4.6` (tema dark/light)
- **react-resizable-panels:** `^2.1.7` (painéis redimensionáveis)
- **date-fns:** `4.1.0` (manipulação de datas)
- **vaul:** `^1.1.2` (drawers)
- **input-otp:** `1.4.2` (entrada OTP)

---

## 📁 Estrutura do Projeto

### `/app/` - Next.js App Router
```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Homepage
├── globals.css         # Estilos globais
├── middleware.ts       # Middleware (autenticação)
├── auth/               # Autenticação
│   ├── callback/       # OAuth callback
│   ├── login/          # Página de login
│   └── signup/         # Página de registro
└── dashboard/          # Dashboard principal
    ├── layout.tsx      # Layout do dashboard
    ├── page.tsx        # Dashboard home
    ├── actions.ts      # Server actions
    ├── caminhoes/      # Gerenciamento de caminhões
    ├── relatorios/     # Relatórios
    └── viagens/        # Gerenciamento de viagens
```

### `/components/` - Componentes React
**Componentes de Business Logic:**
- `app-sidebar.tsx` - Sidebar da aplicação
- `dashboard-header.tsx` - Header do dashboard
- `recent-trips-table.tsx` - Tabela de viagens recentes
- `trip-form-dialog.tsx` - Formulário para criar/editar viagens
- `truck-form-dialog.tsx` - Formulário para criar/editar caminhões
- `delete-trip-dialog.tsx` - Diálogo de confirmação para deletar viagem
- `delete-truck-dialog.tsx` - Diálogo de confirmação para deletar caminhão
- `delete-item-button.tsx` - Botão genérico para deletar
- `add-cost-dialogs.tsx` - Diálogo para adicionar custos
- `revenue-chart.tsx` - Gráfico de receita (Recharts)
- `cost-breakdown-chart.tsx` - Gráfico de breakdown de custos
- `kpi-card.tsx` - Card para KPIs
- `empty-state.tsx` - Estado vazio
- `theme-provider.tsx` - Provider de tema

**UI Components (`/ui/`):**
Primitives reutilizáveis do Radix UI e customizações locais:
- `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`
- `select.tsx`, `checkbox.tsx`, `radio-group.tsx`, `switch.tsx`
- `tabs.tsx`, `accordion.tsx`, `collapsible.tsx`
- `table.tsx`, `dropdown-menu.tsx`, `command.tsx`
- `alert.tsx`, `alert-dialog.tsx`, `tooltip.tsx`, `popover.tsx`
- `scroll-area.tsx`, `sidebar.tsx`, `sheet.tsx`, `drawer.tsx`
- `pagination.tsx`, `badge.tsx`, `avatar.tsx`, `skeleton.tsx`
- `spinner.tsx`, `sonner.tsx`, `toast.tsx`, `toaster.tsx`
- `use-mobile.tsx`, `use-toast.ts`

### `/hooks/` - Custom React Hooks
- `use-mobile.ts` - Detecta se a viewport é mobile
- `use-toast.ts` - Hook para gerenciar toasts

### `/lib/` - Utilidades e Tipos
- `types.ts` - Definições de tipos TypeScript
- `utils.ts` - Funções utilitárias
- `supabase/` - Configuração e clientes Supabase

### `/styles/` - Estilos Globais
- `globals.css` - Estilos CSS globais

### `/public/` - Recursos Estáticos
- Assets públicos da aplicação

### `/scripts/` - Scripts Utilitários
- `001_create_tables.sql` - Script de criação de tabelas no banco de dados

---

## ⚙️ Configurações

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "esnext",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "noEmit": true,
    "allowJs": true,
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### `next.config.mjs`
```javascript
{
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}
```

### `package.json` - Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint ."
  }
}
```

---

## 🔐 Autenticação & Backend

- **Supabase:** Integração com `@supabase/ssr` para autenticação e banco de dados
- **Rotas de Auth:** `/auth/login`, `/auth/signup`, `/auth/callback`
- **Middleware:** `middleware.ts` gerencia proteção de rotas

---

## 🎯 Funcionalidades Principais

1. **Dashboard** - Visão geral de métricas e KPIs
2. **Gerenciamento de Caminhões** - CRUD de veículos
3. **Gerenciamento de Viagens** - Registro e monitoramento de viagens
4. **Relatórios** - Análise de dados e métricas
5. **Gráficos** - Receita e breakdown de custos com Recharts
6. **Tema Dark/Light** - Com next-themes
7. **Responsividade** - Mobile-first design com Tailwind CSS

---

## 📦 Gerenciamento de Dependências

- **Package Manager:** pnpm (verificar `pnpm-lock.yaml`)
- **Node Modules:** Instalados localmente
- **Alternativa:** npm (também suportado via `package-lock.json`)

---

## 🚨 Notas Importantes

- `typescript.ignoreBuildErrors: true` - Build ignora alguns erros de TS (pode ocultar problemas)
- `images.unoptimized: true` - Imagens não são otimizadas pelo Next.js (útil para deploys estáticos)
- Existe uma estrutura duplicada em `/fleetcontrol/` (repositório paralelo)
- Arquivo `.env.local` contém variáveis de ambiente sensíveis (não versionado)

---

## 📝 Próximos Passos

1. Revisar integração Supabase e autenticação
2. Otimizar gráficos e performance do dashboard
3. Adicionar testes unitários e E2E
4. Implementar PWA se necessário
5. Otimizar builds e images
