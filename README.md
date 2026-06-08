# SI Soluções Imobiliárias — Frontend

Interface web desenvolvida em **Next.js 14** para gerenciamento de leads imobiliários.

## 🛠 Tecnologias

| Tecnologia | Versão |
|---|---|
| Next.js | 14.x (App Router) |
| React | ^18 |
| TypeScript | ^5 |
| Tailwind CSS | ^3.4 |
| TanStack Query | ^5 (cache e sincronização) |
| dnd-kit | ^6 (drag & drop no Kanban) |
| Recharts | ^2 (gráficos) |
| Zustand | ^4 (estado global) |
| Axios | ^1.7 |

## 🖥 Páginas

| Rota | Descrição |
|---|---|
| `/login` | Autenticação |
| `/register` | Cadastro de usuário |
| `/dashboard` | Métricas, gráficos e visão geral |
| `/kanban` | Board Kanban com drag & drop |
| `/leads` | Tabela com filtros, busca, paginação e exportação CSV |

Todas as páginas possuem o **ChatBot flutuante** no canto inferior direito.

## 🚀 Como rodar

### Via Docker (recomendado)

Rode pelo `docker-compose.yml` no repositório `si-leads-backend`. O frontend sobe automaticamente junto com os outros serviços.

```bash
# No repositório si-leads-backend:
docker-compose up --build
```

Acesse **http://localhost:3000**

### Manual

**Pré-requisitos:** Node.js 20+, backend rodando em `http://localhost:3001`

```bash
# 1. Instale as dependências
npm install

# 2. Configure o ambiente
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001

# 3. Inicie em modo desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`

## 🔐 Variáveis de ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL da API backend | `http://localhost:3001` |

## 🔗 Integração

O frontend se comunica **exclusivamente com o backend** (`si-leads-backend`). O backend faz o proxy para o microsserviço de IA — o frontend nunca chama a IA diretamente.