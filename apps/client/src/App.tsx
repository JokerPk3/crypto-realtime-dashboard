import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import { SubscriptionPanel } from './components/SubscriptionPanel';
import { PriceView } from './components/PriceView';
import { MatchView } from './components/MatchView';
import { SystemStatus } from './components/SystemStatus';

import { Badge } from './components/reusables/Badge';

import type {
  ServerMessage,
  OrderBook,
  Trade,
  Channel,
} from './types';

function App() {
  const wsRef = useRef<WebSocket | null>(null);

  const [connected, setConnected] =
    useState(false);

  const [subscriptions, setSubscriptions] =
    useState<Set<string>>(new Set());

  const [orderbooks, setOrderbooks] =
    useState<Record<string, OrderBook>>({});

  const [trades, setTrades] = useState<Trade[]>(
    []
  );

  const [channels, setChannels] = useState<
    Channel[]
  >([]);

  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:4000`;

    const ws = new WebSocket(wsUrl);

    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = error => {
      console.error('WebSocket error:', error);
    };

    ws.onmessage = (
      event: MessageEvent
    ) => {
      try {
        const message: ServerMessage =
          JSON.parse(event.data);

        switch (message.type) {
          case 'welcome':
          
            break;

          case 'subscribed':
            if (message.products) {
              setSubscriptions(prev => {
                const updated = new Set(prev);

                message.products?.forEach(
                  product => {
                    updated.add(product);
                  }
                );

                return updated;
              });
            }

            break;

          case 'unsubscribed':
            if (message.products) {
              setSubscriptions(prev => {
                const updated = new Set(prev);

                message.products?.forEach(
                  product => {
                    updated.delete(product);
                  }
                );

                return updated;
              });

              setOrderbooks(prev => {
                const updated = { ...prev };

                message.products?.forEach(
                  product => {
                    delete updated[product];
                  }
                );

                return updated;
              });

              setTrades(prev =>
                prev.filter(
                  trade =>
                    !message.products?.includes(
                      trade.productId
                    )
                )
              );
            }

            break;

          case 'orderbook':
            if (
              message.productId &&
              message.bids &&
              message.asks
            ) {
              const productId = message.productId;
              const bids = message.bids;
              const asks = message.asks;

              setOrderbooks(prev => ({
                ...prev,
                [productId]: {
                  bids,
                  asks,
                },
              }));
            }

            break;

          case 'trade':
            if (
              message.productId &&
              message.price !== undefined &&
              message.size !== undefined
            ) {
              const trade: Trade = {
                id: message.id,
                productId: message.productId,
                side:
                  message.side || 'unknown',
                price: message.price,
                size: message.size,
                tradeId:
                  message.tradeId || '',
                timestamp:
                  message.timestamp ||
                  new Date().toISOString(),
              };

              setTrades(prev =>
                [trade, ...prev].slice(
                  0,
                  100
                )
              );
            }

            break;

          case 'system_status':
            if (message.channels) {
              setChannels(
                message.channels
              );
            }

            break;

          case 'error':
            console.error(
              message.message
            );
            break;

          default:
            break;
        }
      } catch (error) {
        console.error(
          'Error parsing websocket message:',
          error
        );
      }
    };

    return () => {
      if (
        wsRef.current &&
        wsRef.current.readyState ===
        WebSocket.OPEN
      ) {
        wsRef.current.close();
      }
    };
  }, []);

  const subscribe = (
    product: string
  ) => {
    if (
      wsRef.current?.readyState ===
      WebSocket.OPEN
    ) {
      wsRef.current.send(
        JSON.stringify({
          type: 'subscribe',
          products: [product],
        })
      );
    }
  };

  const unsubscribe = (
    product: string
  ) => {
    if (
      wsRef.current?.readyState ===
      WebSocket.OPEN
    ) {
      wsRef.current.send(
        JSON.stringify({
          type: 'unsubscribe',
          products: [product],
        })
      );
    }
  };

  return (
    <div
      className="
        min-h-screen
        bg-zinc-950
        text-zinc-100
      "
    >
      {/* Header */}

      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-zinc-800
          bg-zinc-950/90
          backdrop-blur
        "
      >
        <div
          className="
            max-w-7xl
            mx-auto
            px-6
            py-5
            flex
            items-center
            justify-between
          "
        >
          {/* Left */}

          <div>
            <h1
              className="
                text-3xl
                font-bold
                tracking-tight
              "
            >
              Crypto Realtime Dashboard
            </h1>

            <p
              className="
                text-zinc-400
                mt-1
              "
            >
              Coinbase Pro WebSocket Feed
            </p>
          </div>

          {/* Right */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <Badge
              variant={
                connected
                  ? 'success'
                  : 'danger'
              }
            >
              {connected
                ? 'LIVE'
                : 'OFFLINE'}
            </Badge>
          </div>
        </div>
      </header>

      {/* Stats */}

      <section
        className="
          max-w-7xl
          mx-auto
          px-6
          py-6
        "
      >
        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-4
          "
        >
          <div
            className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-2xl
              p-5
            "
          >
            <p
              className="
                text-sm
                text-zinc-400
              "
            >
              Active Subscriptions
            </p>

            <h2
              className="
                text-3xl
                font-bold
                mt-2
              "
            >
              {
                subscriptions.size
              }
            </h2>
          </div>

          <div
            className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-2xl
              p-5
            "
          >
            <p
              className="
                text-sm
                text-zinc-400
              "
            >
              Order Books
            </p>

            <h2
              className="
                text-3xl
                font-bold
                mt-2
              "
            >
              {
                Object.keys(
                  orderbooks
                ).length
              }
            </h2>
          </div>

          <div
            className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-2xl
              p-5
            "
          >
            <p
              className="
                text-sm
                text-zinc-400
              "
            >
              Recent Trades
            </p>

            <h2
              className="
                text-3xl
                font-bold
                mt-2
              "
            >
              {trades.length}
            </h2>
          </div>
        </div>
      </section>

      {/* Main Grid */}

      <main
        className="
          max-w-7xl
          mx-auto
          px-6
          pb-10
          grid
          grid-cols-1
          lg:grid-cols-12
          gap-6
        "
      >
        {/* Sidebar */}

        <div
          className="
            lg:col-span-4
            space-y-6
          "
        >
          <SubscriptionPanel
            subscriptions={
              subscriptions
            }
            onSubscribe={
              subscribe
            }
            onUnsubscribe={
              unsubscribe
            }
          />

          <SystemStatus
            channels={channels}
            subscriptions={subscriptions}
          />
        </div>

        {/* Main Content */}

        <div
          className="
            lg:col-span-8
            space-y-6
          "
        >
          <PriceView
            orderbooks={
              orderbooks
            }
          />

          <MatchView
            trades={trades}
          />
        </div>
      </main>
    </div>
  );
}

export default App;