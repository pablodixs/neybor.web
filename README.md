# Neybor Web

Frontend web do **Neybor**, uma plataforma de vizinhança criada para aproximar pessoas que vivem ao redor umas das outras e facilitar comunicação local, alertas, serviços e comércio de bairro.

> O projeto está em desenvolvimento ativo. Algumas áreas da interface já possuem integração com a API, enquanto outras ainda estão sendo construídas.

## Sobre o Neybor

O Neybor busca concentrar em um único lugar as interações que fazem parte da vida em uma comunidade: acompanhar o que acontece por perto, conversar com vizinhos, compartilhar informações, encontrar serviços e visualizar alertas da região.

A aplicação web funciona como um dos clientes do ecossistema Neybor e consome uma API própria para autenticação, perfis, feed, alertas e demais recursos.

## Funcionalidades

Atualmente, o Neybor Web inclui:

- autenticação com credenciais e sessões via NextAuth;
- renovação de access token utilizando refresh token;
- feed autenticado de publicações da vizinhança;
- páginas de perfil e detalhes de publicações;
- interações com posts e comentários;
- alertas locais;
- mapa com alertas da região utilizando Mapbox;
- localização do usuário e consulta de alertas pelo viewport do mapa;
- posts salvos;
- configurações de perfil, conta e segurança;
- gerenciamento e identificação de sessões por dispositivo.

Também existem áreas em evolução para **Marketplace**, **Eventos**, **Grupos**, **Mensagens** e **Notificações**.

## Stack

- [Next.js](https://nextjs.org/) 16
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [NextAuth.js](https://next-auth.js.org/)
- [SWR](https://swr.vercel.app/)
- [Axios](https://axios-http.com/)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [react-map-gl](https://visgl.github.io/react-map-gl/)
- [Motion](https://motion.dev/)
- [Phosphor Icons](https://phosphoricons.com/)
- [date-fns](https://date-fns.org/)

## Estrutura do projeto

```text
src/
├── @types/       # Extensões e tipos globais
├── app/          # Rotas e layouts do App Router
│   ├── (app)/    # Área autenticada
│   ├── api/      # Rotas server-side, incluindo NextAuth
│   └── auth/     # Fluxos de autenticação
├── assets/       # Assets utilizados pela aplicação
├── components/   # Componentes reutilizáveis de UI e domínio
├── hooks/        # Hooks customizados
├── interfaces/   # Contratos e respostas da API
├── lib/          # Integrações e utilitários de infraestrutura
└── utils/        # Helpers, mappings e funções compartilhadas
```

A área autenticada contém rotas como:

```text
/feed
/alerts
/map
/bookmarks
/[user]
/settings
/marketplace
/events
/groups
/messages
/notifications
```

## Configuração local

Clone o repositório:

```bash
git clone https://github.com/pablodixs/neybor.web.git
cd neybor.web
```

Instale as dependências:

```bash
npm install
```

O projeto também possui lockfile para Bun, então ele pode ser utilizado como gerenciador de pacotes durante o desenvolvimento.

### Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://localhost:YOUR_BACKEND_PORT
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=YOUR_MAPBOX_ACCESS_TOKEN
```

`NEXT_PUBLIC_API_URL` deve apontar para uma instância disponível do backend do Neybor.

Em ambientes de produção, configure também as variáveis exigidas pela sua instalação do NextAuth, incluindo um secret seguro para assinatura das sessões.

## Executando

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível, por padrão, em:

```text
http://localhost:3000
```

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento do Next.js |
| `npm run build` | Gera o build de produção |
| `npm run start` | Executa o build de produção |
| `npm run lint` | Executa o ESLint |

## Autenticação

O frontend utiliza **NextAuth com Credentials Provider**, conectado diretamente ao backend do Neybor.

O fluxo atual inclui:

1. login pela API do Neybor;
2. armazenamento do access token na sessão JWT do NextAuth;
3. refresh token mantido em cookie `HttpOnly`;
4. renovação automática do access token antes da expiração;
5. envio do token nas requisições autenticadas;
6. revogação do refresh token durante o logout.

O frontend também envia informações básicas da sessão, como dispositivo e user agent, para que o backend possa identificar sessões ativas.

## Mapa e alertas locais

O mapa utiliza **Mapbox** e consulta os alertas com base nos limites atualmente visíveis no viewport. Isso permite que a interface carregue ocorrências relevantes para a região que o usuário está explorando, em vez de depender de uma lista global de coordenadas.

## Ecossistema Neybor

Este repositório contém apenas o cliente web. O projeto também possui aplicações separadas para backend e iOS:

- [neybor.backend](https://github.com/pablodixs/neybor.backend)
- [neybor.ios](https://github.com/pablodixs/neybor.ios)

---

**Neybor** — conecte-se com quem está ao seu lado.
