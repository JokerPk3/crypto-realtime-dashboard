


import React from 'react';

import { Card } from './reusables/Card';
import { EmptyState } from './reusables/EmptyState';

import type { OrderBook } from '../types';

import {
  formatPrice,
  formatSize,
} from '../utils/formatters';

interface PriceViewProps {
  orderbooks: Record<string, OrderBook>;
}

export const PriceView: React.FC<PriceViewProps> = ({
  orderbooks,
}) => {
  const products = Object.keys(orderbooks).sort();

  return (
    <Card title="Order Books">
      {products.length === 0 ? (
        <EmptyState message="No order books available" />
      ) : (
        <div className="space-y-6">
          {products.map(productId => {
            const book = orderbooks[productId];

            return (
              <div
                key={productId}
                className="
                  border
                  border-zinc-800
                  rounded-xl
                  overflow-hidden
                "
              >
                <div
                  className="
                    px-4
                    py-3
                    border-b
                    border-zinc-800
                    bg-zinc-800/50
                  "
                >
                  <h3 className="font-semibold text-zinc-100">
                    {productId}
                  </h3>
                </div>

                <div className="grid grid-cols-2">
                  {/* Bids */}

                  <div className="border-r border-zinc-800">
                    <div
                      className="
                        px-4
                        py-2
                        bg-green-500/10
                        text-green-400
                        text-sm
                        font-semibold
                      "
                    >
                      Bids
                    </div>

                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800">
                          <th className="px-4 py-2 text-left text-zinc-400">
                            Price
                          </th>

                          <th className="px-4 py-2 text-right text-zinc-400">
                            Size
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {book.bids
                          .slice(0, 5)
                          .map((bid, idx) => (
                            <tr
                              key={idx}
                              className="
                                border-b
                                border-zinc-800/50
                                hover:bg-zinc-800/30
                              "
                            >
                              <td className="px-4 py-2 font-mono text-green-400">
                                {formatPrice(bid[0])}
                              </td>

                              <td className="px-4 py-2 text-right font-mono text-zinc-300">
                                {formatSize(bid[1])}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Asks */}

                  <div>
                    <div
                      className="
                        px-4
                        py-2
                        bg-red-500/10
                        text-red-400
                        text-sm
                        font-semibold
                      "
                    >
                      Asks
                    </div>

                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800">
                          <th className="px-4 py-2 text-left text-zinc-400">
                            Price
                          </th>

                          <th className="px-4 py-2 text-right text-zinc-400">
                            Size
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {book.asks
                          .slice(0, 5)
                          .map((ask, idx) => (
                            <tr
                              key={idx}
                              className="
                                border-b
                                border-zinc-800/50
                                hover:bg-zinc-800/30
                              "
                            >
                              <td className="px-4 py-2 font-mono text-red-400">
                                {formatPrice(ask[0])}
                              </td>

                              <td className="px-4 py-2 text-right font-mono text-zinc-300">
                                {formatSize(ask[1])}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};