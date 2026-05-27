


import React from 'react';

import { Card } from './reusables/Card';
import { Table } from './reusables/Table';
import { Badge } from './reusables/Badge';
import { EmptyState } from './reusables/EmptyState';

import type { Trade } from '../types';

import {
  formatPrice,
  formatSize,
  formatTime,
} from '../utils/formatters';

interface MatchViewProps {
  trades: Trade[];
}

export const MatchView: React.FC<MatchViewProps> = ({
  trades,
}) => {
  const columns = [
    {
      header: 'Time',
      accessor: 'timestamp' as keyof Trade,
      render: (trade: Trade) => (
        <span className="text-zinc-400">
          {formatTime(trade.timestamp)}
        </span>
      ),
    },

    {
      header: 'Product',
      accessor: 'productId' as keyof Trade,
      render: (trade: Trade) => (
        <span className="font-semibold text-zinc-200">
          {trade.productId}
        </span>
      ),
    },

    {
      header: 'Side',
      accessor: 'side' as keyof Trade,
      render: (trade: Trade) => (
        <Badge
          variant={
            trade.side === 'buy'
              ? 'success'
              : 'danger'
          }
        >
          {trade.side}
        </Badge>
      ),
    },

    {
      header: 'Price',
      accessor: 'price' as keyof Trade,
      className: 'text-right',
      render: (trade: Trade) => (
        <span className="text-zinc-100 font-semibold">
          {formatPrice(trade.price)}
        </span>
      ),
    },

    {
      header: 'Size',
      accessor: 'size' as keyof Trade,
      className: 'text-right',
      render: (trade: Trade) => (
        <span className="text-zinc-300">
          {formatSize(trade.size)}
        </span>
      ),
    },
  ];

  return (
    <Card title="Recent Trades">
      {trades.length > 0 ? (
        <div className="max-h-[500px] overflow-y-auto">
          <Table
            columns={columns}
            data={trades.slice(0, 50)}
          />
        </div>
      ) : (
        <EmptyState message="No trades yet" />
      )}
    </Card>
  );
};