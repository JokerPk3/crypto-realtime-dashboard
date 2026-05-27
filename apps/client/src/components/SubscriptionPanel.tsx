
import React from 'react';

import { Card } from './reusables/Card';
import { Badge } from './reusables/Badge';

interface SubscriptionPanelProps {
  subscriptions: Set<string>;

  onSubscribe: (product: string) => void;

  onUnsubscribe: (product: string) => void;
}

const PRODUCTS = [
  'BTC-USD',
  'ETH-USD',
  'XRP-USD',
  'LTC-USD',
];

export const SubscriptionPanel: React.FC<
  SubscriptionPanelProps
> = ({
  subscriptions,
  onSubscribe,
  onUnsubscribe,
}) => {
  const handleToggle = (product: string) => {
    if (subscriptions.has(product)) {
      onUnsubscribe(product);
    } else {
      onSubscribe(product);
    }
  };

  return (
    <Card
      title="Subscriptions"
      action={
        <Badge variant="neutral">
          {subscriptions.size} Active
        </Badge>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        {PRODUCTS.map(product => {
          const active = subscriptions.has(product);

          return (
            <button
              key={product}
              onClick={() => handleToggle(product)}
              className={`
                p-4
                rounded-xl
                border
                transition-all
                duration-200
                text-left

                ${
                  active
                    ? `
                      bg-green-500/10
                      border-green-500/30
                      hover:bg-green-500/20
                    `
                    : `
                      bg-zinc-800/40
                      border-zinc-700
                      hover:bg-zinc-800
                    `
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-zinc-100">
                    {product}
                  </p>

                  <p className="text-sm text-zinc-400 mt-1">
                    {active
                      ? 'Receiving realtime data'
                      : 'Click to subscribe'}
                  </p>
                </div>

                <Badge
                  variant={
                    active ? 'success' : 'neutral'
                  }
                >
                  {active ? 'LIVE' : 'OFF'}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};