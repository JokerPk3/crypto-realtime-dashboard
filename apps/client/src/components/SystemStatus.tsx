import React from 'react';

import { Card } from './reusables/Card';
import { Badge } from './reusables/Badge';
import { EmptyState } from './reusables/EmptyState';

import type { Channel } from '../types';

interface SystemStatusProps {
  channels: Channel[];

  subscriptions: Set<string>;
}

export const SystemStatus: React.FC<
  SystemStatusProps
> = ({
  channels,
  subscriptions,
}) => {
  return (
    <Card
      title="System Status"
      action={
        <Badge variant="success">
          {subscriptions.size} Active
        </Badge>
      }
    >
      {channels.length > 0 ? (
        <div className="space-y-4">
          {channels.map((channel, idx) => {
            const activeProducts =
              channel.product_ids.filter(
                product =>
                  subscriptions.has(
                    product
                  )
              );

            return (
              <div
                key={idx}
                className="
                  border
                  border-zinc-800
                  rounded-xl
                  p-4
                  bg-zinc-800/30
                  hover:bg-zinc-800/50
                  transition-colors
                "
              >
                {/* Top */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    mb-3
                  "
                >
                  <div>
                    <p
                      className="
                        text-sm
                        text-zinc-400
                      "
                    >
                      Channel
                    </p>

                    <h3
                      className="
                        text-lg
                        font-semibold
                        text-zinc-100
                        capitalize
                      "
                    >
                      {channel.name}
                    </h3>
                  </div>

                  <Badge
                    variant={
                      activeProducts.length >
                      0
                        ? 'success'
                        : 'neutral'
                    }
                  >
                    {
                      activeProducts.length
                    }{' '}
                    Active
                  </Badge>
                </div>

                {/* Products */}

                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  {channel.product_ids.map(
                    product => {
                      const active =
                        subscriptions.has(
                          product
                        );

                      return (
                        <span
                          key={product}
                          className={`
                            px-3
                            py-1.5
                            rounded-lg
                            border
                            text-xs
                            font-medium
                            transition-colors

                            ${
                              active
                                ? `
                                  bg-green-500/10
                                  border-green-500/30
                                  text-green-400
                                `
                                : `
                                  bg-zinc-900
                                  border-zinc-700
                                  text-zinc-400
                                `
                            }
                          `}
                        >
                          {product}
                        </span>
                      );
                    }
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState message="No channel data available" />
      )}
    </Card>
  );
};