import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

import { orderbookManager } from '../orderbook/orderbook.service';
import { matchEngine } from '../matches/matches.service';
import { systemStatusService } from '../system-status/system-status.service';
import { COINBASE_PRODUCTS, COINBASE_CHANNELS } from './coinbase.constants';
import type { CoinbaseSubscribeMessage } from './coinbase.types';
import { parseCoinbaseMessage } from './coinbase.utils';

export class CoinbaseStreamManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isConnecting = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastMessageTime = 0;

  constructor() {
    super();
  }

  public connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    logger.info(`Connecting to Coinbase WebSocket: ${env.COINBASE_WS_URL}`);

    this.ws = new WebSocket(env.COINBASE_WS_URL);

    this.ws.on('open', this.handleOpen.bind(this));
    this.ws.on('message', this.handleMessage.bind(this));
    this.ws.on('close', this.handleClose.bind(this));
    this.ws.on('error', this.handleError.bind(this));
  }

  public disconnect() {
    this.stopHeartbeatMonitor();
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close();
      this.ws = null;
    }
    this.isConnecting = false;
    logger.info('Disconnected from Coinbase WebSocket');
  }

  private handleOpen() {
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.lastMessageTime = Date.now();
    systemStatusService.setConnectionState(true);
    logger.info('Connected to Coinbase WebSocket');

    this.subscribe();
    this.startHeartbeatMonitor();
  }

  private subscribe() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const subscribeMessage: CoinbaseSubscribeMessage = {
      type: 'subscribe',
      product_ids: COINBASE_PRODUCTS,
      channels: COINBASE_CHANNELS,
    };

    this.ws.send(JSON.stringify(subscribeMessage));
    logger.info(`Sent subscription message for products: ${COINBASE_PRODUCTS.join(', ')}`);
  }

  private handleMessage(data: WebSocket.Data) {
    this.lastMessageTime = Date.now();
    const message = parseCoinbaseMessage(data.toString());

    if (!message) return;

    switch (message.type) {
      case 'snapshot':
        orderbookManager.applySnapshot(message);
        this.emit('snapshot', message);
        break;
      case 'l2update':
        orderbookManager.applyDelta(message);
        this.emit('l2update', message);
        break;
      case 'match':
      case 'last_match':
        matchEngine.processTrade(message);
        this.emit('match', message);
        break;
      case 'status':
        systemStatusService.updateCoinbaseStatus(message);
        this.emit('status', message);
        break;
      case 'subscriptions':
        logger.info('Received subscription confirmation from Coinbase');
        import('../../config/redis').then(({ publishToChannel }) => {
            publishToChannel('market:system:subscriptions', message);
        });
        this.emit('subscriptions', message);
        break;
      case 'error':
        logger.error('Coinbase WS Error:', message);
        break;
      default:
        break;
    }
  }

  private handleClose(code: number, reason: Buffer) {
    this.isConnecting = false;
    this.stopHeartbeatMonitor();
    systemStatusService.setConnectionState(false);
    logger.warn(`Coinbase WebSocket closed. Code: ${code}, Reason: ${reason.toString()}`);
    this.scheduleReconnect();
  }

  private handleError(error: Error) {
    logger.error('Coinbase WebSocket error:', error);
    // Connection will likely close, triggering handleClose
  }

  private async scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached. Shutting down or raising alert.');
      return;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, up to 30s
    const backoff = Math.min(Math.pow(2, this.reconnectAttempts) * 1000, 30000);
    this.reconnectAttempts++;
    systemStatusService.incrementReconnects();

    logger.info(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${backoff}ms`);

    setTimeout(() => {
      this.connect();
    }, backoff);
  }

  private startHeartbeatMonitor() {
    this.stopHeartbeatMonitor();
    this.heartbeatInterval = setInterval(() => {
      // If we haven't received a message in 15 seconds, assume stale connection
      if (Date.now() - this.lastMessageTime > 15000) {
        logger.warn('No messages received from Coinbase in 15s. Forcing reconnect.');
        if (this.ws) {
          this.ws.terminate(); // Triggers handleClose
        }
      }
    }, 5000);
  }

  private stopHeartbeatMonitor() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Singleton instance
export const coinbaseManager = new CoinbaseStreamManager();
