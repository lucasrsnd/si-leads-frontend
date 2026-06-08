# SI Soluções Imobiliárias — Frontend

Interface web desenvolvida em **Next.js 14** para gerenciamento de leads imobiliários.

## 🛠 Tecnologias

| Tecnologia | Versão |
|---|---|
| Next.js | 14.x (App Router) |
| React | ^18 |
| TypeScript | ^5 |
| Tailwind CSS | ^3.4 |
| TanStack Query | ^5 |
| dnd-kit | ^6 (drag & drop) |
| Recharts | ^2 (gráficos) |
| Zustand | ^4 (estado global) |
| Axios | ^1.7 |

## ⚙️ Configuração

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/si-leads-frontend

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite com a URL do backend

# 4. Inicie em modo desenvolvimento
npm run dev
```

Acesse: `http://localhost:3000`

## 🖥 Páginas

| Rota | Descrição |
|---|---|
| `/login` | Tela de autenticação |
| `/register` | Cadastro de usuário |
| `/dashboard` | Métricas, gráficos e visão geral |
| `/kanban` | Board Kanban com drag & drop |
| `/leads` | Tabela de leads com filtros, busca e exportação CSV |

## 🔐 Variáveis de ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL do backend NestJS | `http://localhost:3001` |

## 🐳 Docker

```bash
docker build -t si-leads-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://backend:3001 si-leads-frontend
```

Ou use o `docker-compose.yml` na raiz do projeto.

## 🔗 Integração

O frontend se comunica exclusivamente com o **Backend NestJS** em `NEXT_PUBLIC_API_URL`.
O backend faz o proxy para o microsserviço de IA — o frontend nunca chama a IA diretamente.
