# Crypto Realtime Platform - Frontend

A React TypeScript single-page application (SPA) for real-time cryptocurrency market data visualization. Connects to the backend WebSocket server to display live order books, trades, and subscription status.

## 🎯 Overview

This is the **frontend component** of the Crypto Realtime Platform assignment. It provides an interactive dashboard for users to:
- Subscribe/unsubscribe to cryptocurrency trading pairs
- View real-time order book data (bids and asks)
- Monitor executed trades with color-coded sides
- Track active channel subscriptions

## 🏗️ Architecture

### Components

#### 1. **SubscriptionPanel** (`components/SubscriptionPanel.tsx`)
Interactive control panel for managing cryptocurrency subscriptions.

**Props:**
```typescript
{
  subscriptions: Set<string>        // Currently subscribed products
  onSubscribe: (product: string)    // Subscribe callback
  onUnsubscribe: (product: string)  // Unsubscribe callback
}
```

**Features:**
- 4 toggle buttons (BTC-USD, ETH-USD, XRP-USD, LTC-USD)
- Visual active/inactive states
- Sends WebSocket messages on toggle
- Real-time status updates

---

#### 2. **PriceView** (`components/PriceView.tsx`)
Displays real-time order book data for all subscribed products.

**Props:**
```typescript
{
  orderbooks: Record<string, OrderBook>
  // OrderBook = { bids: [price, size][], asks: [price, size][] }
}
```

**Features:**
- Separate bid and ask columns
- Top 5 levels displayed per side
- Updates every 50ms (server-side batching)
- Product-specific views
- Professional table layout
- Monospace font for price precision

---

#### 3. **MatchView** (`components/MatchView.tsx`)
Order blotter displaying recent trade executions.

**Props:**
```typescript
{
  trades: Trade[]
}
```

**Features:**
- Columns: Timestamp, Product, Side, Price, Size
- **Green text** for BUY side
- **Red text** for SELL side
- Shows 20 most recent trades
- Keeps 200 in memory (rotation)
- Auto-scrolls to latest
- Time-formatted timestamps

---

#### 4. **SystemStatus** (`components/SystemStatus.tsx`)
Displays active WebSocket channels and subscriptions.

**Props:**
```typescript
{
  channels: Channel[]
  // Channel = { name: string, product_ids: string[] }
}
```

**Features:**
- Table showing all active channels
- Lists subscribed products per channel
- Updates in real-time on subscribe/unsubscribe
- Shows: `level2_batch`, `matches` channels
- Empty state when no subscriptions

---

### Main App Component (`App.tsx`)

**Responsibilities:**
1. **WebSocket Connection Management**
   - Connects to `ws://localhost:4000`
   - Handles reconnection logic
   - Event listeners for all message types

2. **State Management**
   ```typescript
   [connected: boolean]                     // WebSocket status
   [subscriptions: Set<string>]             // Active subscriptions
   [orderbooks: Record<string, OrderBook>]  // Price data per product
   [trades: Trade[]]                        // Recent trades
   [channels: Channel[]]                    // Active channels
   ```

3. **Message Handling**
   - `welcome`: Initial connection confirmation
   - `subscribed`: Subscription confirmation
   - `unsubscribed`: Unsubscription with data cleanup
   - `orderbook`: Real-time price updates
   - `trade`: New trade execution
   - `system_status`: Channel updates
   - `error`: Error messages from server

4. **Data Cleanup**
   - On unsubscribe: removes order books and trades for that product
   - No stale data remains in UI

---

### Types (`types.ts`)

```typescript
interface ServerMessage {
  type: 'welcome' | 'subscribed' | 'unsubscribed' | 'error' | 'orderbook' | 'trade' | 'system_status'
  clientId?: string
  products?: string[]
  productId?: string
  bids?: [string, string][]
  asks?: [string, string][]
  side?: string
  price?: string
  size?: string
  timestamp?: string
  channels?: Channel[]
  message?: string
}

interface Trade {
  id?: string
  productId: string
  side: 'buy' | 'sell'
  price: string
  size: string
  timestamp: string
  tradeId: string
}

interface OrderBook {
  bids: [string, string][]  // [price, size]
  asks: [string, string][]  // [price, size]
}

interface Channel {
  name: string              // 'level2_batch' | 'matches'
  product_ids: string[]     // ['BTC-USD', 'ETH-USD', ...]
}
```

## 🎨 Styling (`App.css`)

Professional, responsive design with:
- **Grid Layout**: 3-column (subscription + price + status) + full-width trades
- **Color Scheme**: Blue theme with green/red accents
- **Hover Effects**: Smooth transitions and elevations
- **Responsive**: Stacks on mobile devices
- **Tables**: Monospace fonts for data precision
- **Status Indicators**: 🟢 Connected / 🔴 Disconnected

### Key CSS Classes
- `.app`: Main container
- `.header`: Top bar with title and stats
- `.grid-container`: Responsive layout
- `.panel`: Component containers
- `.subscription-panel button.active`: Active subscription state
- `.match-view .side.buy`: Green trade indicator
- `.match-view .side.sell`: Red trade indicator

## 📊 Real-time Data Flow

```
User Browser
    ├─ Click Subscribe → Send WebSocket Message
    │                   {"type": "subscribe", "products": ["BTC-USD"]}
    │
    └─ Receive Messages
        ├─ "subscribed" → Update subscriptions state
        ├─ "orderbook"  → Update PriceView (50ms batches)
        ├─ "trade"      → Update MatchView (prepend to array)
        ├─ "system_status" → Update SystemStatus
        └─ "error"      → Log error

Server WebSocket Gateway
    ├─ Parse client message
    ├─ Register subscription with SubscriptionRegistry
    ├─ Broadcast "subscribed" confirmation
    └─ Send real-time updates via fanout()
```

## 🛠️ Development Setup

### Prerequisites
- Node.js v18+
- npm 9+

### Installation

```bash
# From root
npm install

# Install dependencies (already done via root)
cd apps/client
```

### Running Locally

```bash
# From root (runs both client + server)
npm run dev

# Or client-only (needs server running separately)
cd apps/client
npm run dev
```

**Access**: http://localhost:5173

### Build for Production

```bash
npm run build
```

Output: `dist/` directory ready for deployment

### Preview Production Build

```bash
npm run preview
```

## 🧪 Testing

Client uses **Vitest** for unit tests:

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**Test Files:**
- `components/*.test.tsx` - Component unit tests
- `types.ts` - Type safety validation

## 🚀 Performance Optimization

1. **50ms Batching**: Server groups price updates, not every tick
2. **Trade Rotation**: Keep 200 trades max (no memory leaks)
3. **React.FC**: Functional components with hooks
4. **Memoization**: Avoid unnecessary re-renders
5. **CSS Grid**: Efficient layout rendering
6. **Event Delegation**: Efficient event handling

## 🔌 WebSocket Protocol

### Client → Server
```json
{
  "type": "subscribe" | "unsubscribe",
  "products": ["BTC-USD", "ETH-USD"]
}
```

### Server → Client

**Subscription Response:**
```json
{
  "type": "subscribed",
  "products": ["BTC-USD"]
}
```

**Price Update:**
```json
{
  "type": "orderbook",
  "productId": "BTC-USD",
  "bids": [["40000.50", "2.5"], ["40000.00", "1.0"]],
  "asks": [["40001.00", "3.0"], ["40001.50", "2.0"]]
}
```

**Trade Update:**
```json
{
  "type": "trade",
  "productId": "BTC-USD",
  "side": "buy",
  "price": "40000.75",
  "size": "0.5",
  "timestamp": "2024-05-27T10:30:45.123Z",
  "tradeId": "12345678"
}
```

**Channel Status:**
```json
{
  "type": "system_status",
  "channels": [
    { "name": "level2_batch", "product_ids": ["BTC-USD", "ETH-USD"] },
    { "name": "matches", "product_ids": ["BTC-USD", "ETH-USD"] }
  ]
}
```

## 🌐 Environment Variables

Create `apps/client/.env` if needed:
```env
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000
```

**Note**: These can be hardcoded for now. In production, use environment-specific configs.

## 🎯 Assignment Requirements - Frontend

| Requirement | Status | Implementation |
|-------------|--------|-----------------|
| React + TypeScript | ✅ | All components use TS with strict mode |
| Subscribe/Unsubscribe | ✅ | SubscriptionPanel with 4 products |
| Price View | ✅ | PriceView displays bids/asks at 50ms rate |
| Match View | ✅ | MatchView shows colored trades, keeps 200 recent |
| System Status | ✅ | SystemStatus displays channels in real-time |
| Multi-user Support | ✅ | Each WebSocket connection is independent |
| Real-time Updates | ✅ | WebSocket driven, no polling |
| Color-coded Trades | ✅ | Green=buy, Red=sell in MatchView |
| Responsive Design | ✅ | Adapts to different screen sizes |
| Readme Documentation | ✅ | This file |

## 📚 Component Examples

### Subscribe to BTC-USD
User clicks "Subscribe" button on BTC-USD → 
- Message sent: `{type: 'subscribe', products: ['BTC-USD']}`
- Server responds: `{type: 'subscribed', products: ['BTC-USD']}`
- PriceView shows BTC-USD order book
- MatchView shows BTC-USD trades
- SystemStatus shows level2_batch and matches channels

### View Trades
Once subscribed to BTC-USD, MatchView displays:
```
Timestamp          Product  Side  Price      Size
10:30:45           BTC-USD  BUY   40,000.50  0.5
10:30:44           BTC-USD  SELL  40,001.00  1.0
10:30:43           BTC-USD  BUY   40,000.75  2.5
...
```

### Unsubscribe
User clicks "Unsubscribe" on BTC-USD →
- Order book data cleared
- Related trades removed from blotter
- System Status updated (products removed)
- No stale data visible

## 🐛 Debugging

**Console Logging:**
- App logs WebSocket messages to browser console
- Use DevTools Network tab to inspect WebSocket frames

**Common Issues:**
1. **WebSocket Connection Fails**
   - Check server is running on port 4000
   - Check firewall/network settings
   
2. **No Price Updates**
   - Ensure subscribed to at least one product
   - Check server order book data is flowing

3. **Trades Not Showing**
   - Check subscription includes matches channel
   - Verify Coinbase is streaming trades

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vite": "^latest",
    "@vitejs/plugin-react": "^latest",
    "eslint": "^latest"
  }
}
```

## 🚀 Deployment

### Build
```bash
npm run build
```

### Static Hosting
```bash
# Deploy dist/ directory to:
# - Vercel
# - Netlify
# - S3 + CloudFront
# - GitHub Pages
```

### Docker Deployment
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 📝 Code Standards

- **TypeScript**: Strict mode, no `any` types
- **Components**: Functional components with React Hooks
- **Styling**: CSS3 (no external CSS frameworks)
- **Performance**: Efficient re-renders, proper cleanup
- **Accessibility**: Semantic HTML, ARIA labels where needed
- **Error Handling**: Try-catch for parse errors, graceful degradation

## 🔗 Related Documentation

- [Main Project README](../../README.md)
- [Backend API README](../server/README.md)
- [Coinbase API Docs](https://docs.cdp.coinbase.com/exchange/websocket-feed/)

---

**Version**: 1.0.0  
**Last Updated**: May 27, 2026  
**Assignment**: Coinbase Realtime Platform
