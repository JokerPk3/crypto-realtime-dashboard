# Crypto Realtime Platform

A high-performance, production-grade realtime cryptocurrency market streaming single-page application (SPA) built with **React + TypeScript** (frontend) and **Node.js + Express** (backend), integrated with the Coinbase Pro WebSocket API.

## 📋 Project Overview

This assignment implements a complete real-time crypto trading dashboard that allows users to:
- **Subscribe/Unsubscribe** to cryptocurrency trading pairs (BTC-USD, ETH-USD, XRP-USD, LTC-USD)
- **View Price Data** with live bid/ask order books updated every 50ms
- **Monitor Trades** via an order blotter showing recent match executions with color-coded sides
- **Track System Status** displaying active channels and subscriptions
- **Support Multiple Users** where each user maintains independent subscriptions

### Key Requirements Met ✅
- ✅ **TypeScript** throughout codebase (client & server)
- ✅ **Real-time Updates** via WebSocket (50ms refresh rate for prices)
- ✅ **Multi-user Support** with isolated subscriptions per client
- ✅ **Unit Tests** for critical services (health, orderbook, registry)
- ✅ **Environment Variables** with Zod validation (no hardcoding)
- ✅ **High-Latency Standards** with Redis Pub/Sub, connection pooling, and optimized data structures
- ✅ **Proper Documentation** (this README + component docs)

## 🏗️ Architecture

The system connects to **Coinbase Pro WebSocket Feed**, processes realtime market data, and publishes updates to connected clients via a fan-out architecture using Redis Pub/Sub.

```
┌─────────────────┐
│  Browser        │
│  React SPA      │
└────────┬────────┘
         │ WebSocket
         │ (Client)
┌────────▼────────────────────┐
│  Express Server             │
│  - WebSocket Gateway        │ ◄─── Redis Pub/Sub
│  - Connection Management    │      (fan-out)
└────────┬─────┬──────────────┘
         │     │
         │     └─────────────────┐
         │                       │
    ┌────▼──────┐        ┌──────▼────┐
    │  Coinbase │        │  Redis    │
    │  WebSocket│        │  (Caching)│
    │  Feed     │        └───────────┘
    └───────────┘
```

### Core Components
1. **Frontend (React SPA)**
   - SubscriptionPanel: Subscribe/unsubscribe to products
   - PriceView: Display real-time order books (level2 data)
   - MatchView: Order blotter with recent trades
   - SystemStatus: Display active channels and subscriptions

2. **Backend (Node.js/Express)**
   - **Coinbase Stream Manager**: Persistent WebSocket connection with auto-reconnect
   - **OrderBook Engine**: In-memory limit order book, flushed every 50ms
   - **Match Engine**: Buffers and distributes recent trades to clients
   - **WebSocket Gateway**: Multi-client management with Redis Pub/Sub
   - **REST API**: Health checks, trades history, system metrics
   - **System Status Service**: Tracks connection health and active channels

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React 18, TypeScript, Vite, CSS3 |
| **Backend** | Node.js, Express.js, TypeScript |
| **Real-time** | WebSocket (ws), Redis Pub/Sub |
| **Validation** | Zod |
| **Logging** | Winston |
| **Testing** | Jest, Supertest |
| **Monorepo** | Turborepo |

## 📦 Project Structure

```
crypto-realtime-platform/
├── apps/
│   ├── client/                 # React SPA
│   │   ├── src/
│   │   │   ├── components/     # 4 UI components
│   │   │   ├── types.ts        # TypeScript interfaces
│   │   │   ├── App.tsx         # Main app logic
│   │   │   └── App.css         # Styling
│   │   └── vite.config.ts
│   │
│   └── server/                 # Express backend
│       ├── src/
│       │   ├── modules/        # Feature modules
│       │   │   ├── coinbase/   # Coinbase integration
│       │   │   ├── websocket/  # WebSocket gateway
│       │   │   ├── orderbook/  # Order book engine
│       │   │   ├── matches/    # Trade matching
│       │   │   └── ...
│       │   ├── config/         # Configuration
│       │   └── shared/         # Middleware, errors, handlers
│       └── jest.config.js
│
├── packages/
│   ├── shared-types/           # Shared TS types
│   └── shared-utils/           # Shared utilities
│
├── docker-compose.yml
├── turbo.json
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **Docker & Docker Compose**
- **npm** 9+
- Coinbase Pro API access (public endpoint - no credentials needed)

### Installation

1. **Clone & Install**
   ```bash
   git clone <repository>
   cd crypto-realtime-platform
   npm install
   ```

2. **Setup Environment**
   ```bash
   # Root level (if needed)
   cp .env.example .env
   
   # Server configuration
   cd apps/server
   cp .env.example .env
   ```

3. **Start Infrastructure**
   ```bash
   docker-compose up -d
   ```

4. **Run Development Servers**
   ```bash
   # From root directory
   npm run dev
   ```
   - **Frontend**: http://localhost:5173
   - **Backend**: http://localhost:4000

5. **Run Tests**
   ```bash
   npm run test
   # or for specific app
   cd apps/server && npm run test
   ```

## 📚 Documentation

- [Client README](./apps/client/README.md) - React SPA documentation
- [Server README](./apps/server/README.md) - Backend API documentation

## 🔌 API Endpoints

### WebSocket
- **Endpoint**: `ws://localhost:4000`
- **Message Types**: `subscribe`, `unsubscribe`, `orderbook`, `trade`, `system_status`

### REST Endpoints
- `GET /api/health` - Health check
- `GET /api/system-status` - System health and metrics
- `GET /api/metrics` - Performance metrics

## 🧪 Testing

Unit tests are mandatory for:
- WebSocket Registry (client subscription management)
- OrderBook Service (price data structure)
- Health Service (connectivity checks)

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🌍 Environment Variables

### Server (`apps/server/.env`)
```env
PORT=4000
NODE_ENV=development
COINBASE_WS_URL=wss://ws-feed.exchange.coinbase.com
REDIS_URL=redis://localhost:6379
FLUSH_INTERVAL_MS=50
MAX_TRADES=200
LOG_LEVEL=info
```

### Client (`apps/client/.env`)
```env
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000
```

**No hardcoded values** - all configuration via environment variables with Zod validation.

## 🎯 Features Implemented

### 1. **Subscribe/Unsubscribe Component**
- Toggle buttons for BTC-USD, ETH-USD, XRP-USD, LTC-USD
- Visual feedback (active/inactive states)
- Sends WebSocket messages to server
- Updates real-time subscription status

### 2. **Price View (Order Book)**
- **Bids**: Buy orders (green background)
- **Asks**: Sell orders (red background)
- Updated every 50ms from server
- Displays top 5 levels per side
- Product-specific views

### 3. **Match View (Trade Blotter)**
- Real-time trades from Coinbase API
- Columns: Timestamp, Product, Side, Price, Size
- **Green text** for buy side
- **Red text** for sell side
- Keeps 200 most recent matches
- Auto-scrolls to show latest trade

### 4. **System Status**
- Lists all active channels per client
- Shows subscribed products per channel
- Updates on every subscribe/unsubscribe
- Channel types: `level2_batch`, `matches`

## 📊 Performance & Scalability

- **50ms Price Updates**: Server flushes order book snapshots every 50ms
- **Redis Pub/Sub**: Horizontal scaling for multiple server instances
- **In-Memory Order Books**: Fast lookups and updates
- **Trade Buffering**: Maintains recent trades in memory for quick access
- **Efficient WebSocket Distribution**: Direct fanout to subscribed clients

## 🔒 Multi-User Isolation

Each client:
- Gets a unique `clientId` on connection
- Maintains independent subscriptions
- Only receives updates for subscribed products
- Can subscribe/unsubscribe independently
- Data is isolated per WebSocket connection

## 📝 Coding Standards

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with type-aware rules
- **Formatting**: Prettier configured
- **Error Handling**: Custom AppError class
- **Async Operations**: AsyncHandler middleware
- **Validation**: Zod schemas for all inputs
- **Logging**: Winston logger with levels

## 🐛 Error Handling

- Network disconnections auto-reconnect
- Invalid subscriptions return error messages
- Database failures logged but don't crash server
- WebSocket errors gracefully handled
- User-friendly error messages on UI

## 🚀 Production Deployment

- Use PM2 or systemd for process management
- Enable CORS restrictions (currently wide open)
- Use environment-specific .env files
- Enable SSL/TLS for WebSocket (wss://)
- Set up monitoring and alerting
- Use horizontal scaling with Redis
- Database backups and replication

## 📄 License

This project is part of a technical assignment.

---

**For detailed component and API documentation, see:**
- [Frontend Guide](./apps/client/README.md)
- [Backend Guide](./apps/server/README.md)
