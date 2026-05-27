import WebSocket, { Server } from 'ws';
import type { Server as HttpServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { SubscriptionRegistry } from './websocket.registry';
import type { ClientMessage, ServerMessage } from './websocket.types';
import { logger } from '../../config/logger';
import { redisSubscriber } from '../../config/redis';

export class WebSocketGateway {
  private wss: Server | null = null;
  private registry = new SubscriptionRegistry();
  private clients: Map<string, WebSocket> = new Map();

  public initialize(server: HttpServer) {
    this.wss = new Server({ server });
    this.wss.on('connection', this.handleConnection.bind(this));
    this.setupRedisSubscriber();
    logger.info('WebSocket Gateway initialized');
  }

  private handleConnection(ws: WebSocket) {
    const clientId = uuidv4();
    this.clients.set(clientId, ws);

    logger.info(`Client connected: ${clientId}`);

    const welcomeMsg: ServerMessage = { type: 'welcome', clientId };
    ws.send(JSON.stringify(welcomeMsg));
    
    // Send initial system status (empty until they subscribe)
    this.sendSystemStatus(clientId);

    ws.on('message', (message: string) => this.handleMessage(clientId, message));
    ws.on('close', () => this.handleDisconnect(clientId));
    ws.on('error', (error) => {
      logger.error(`WebSocket error for client ${clientId}:`, error);
    });
  }

  private handleMessage(clientId: string, data: string) {
    try {
      const message = JSON.parse(data) as ClientMessage;

      if (!message.products || !Array.isArray(message.products)) {
        throw new Error('Invalid products array');
      }

      if (message.type === 'subscribe') {
        message.products.forEach(p => this.registry.subscribe(clientId, p));
        this.sendMessage(clientId, { type: 'subscribed', products: message.products });
        this.sendSystemStatus(clientId);
      } else if (message.type === 'unsubscribe') {
        message.products.forEach(p => this.registry.unsubscribe(clientId, p));
        this.sendMessage(clientId, { type: 'unsubscribed', products: message.products });
        this.sendSystemStatus(clientId);
      } else {
        throw new Error('Unknown message type');
      }
    } catch (error) {
      this.sendMessage(clientId, { type: 'error', message: (error as Error).message });
    }
  }

  private handleDisconnect(clientId: string) {
    this.registry.unsubscribeAll(clientId);
    this.clients.delete(clientId);
    logger.info(`Client disconnected: ${clientId}`);
  }

  private sendMessage(clientId: string, message: ServerMessage) {
    const ws = this.clients.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendSystemStatus(clientId: string) {
    const subscriptions = this.registry.getSubscriptions(clientId);
    const products = Array.from(subscriptions).sort();
    
    const channels = [
      { name: 'level2_batch', product_ids: products },
      { name: 'matches', product_ids: products },
    ].filter(ch => products.length > 0);

    this.sendMessage(clientId, { 
      type: 'system_status', 
      channels: channels.length > 0 ? channels : [] 
    });
  }

  public fanout(productId: string, data: unknown) {
    const subscribers = this.registry.getSubscribers(productId);
    const messageStr = JSON.stringify(data);
    for (const clientId of subscribers) {
      const ws = this.clients.get(clientId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    }
  }

  public broadcastAll(data: unknown) {
    const messageStr = JSON.stringify(data);
    for (const ws of this.clients.values()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    }
  }

  public closeAll() {
    if (this.wss) {
      for (const ws of this.clients.values()) {
        ws.close(1000, 'Server shutting down');
      }
      this.wss.close();
    }
  }

  private setupRedisSubscriber() {
    redisSubscriber.psubscribe('market:*', (err, count) => {
      if (err) {
        logger.error('Failed to psubscribe to market:* channels', err);
      } else {
        logger.info(`WebSocket Gateway psubscribed to market:* (${count} patterns)`);
      }
    });

    redisSubscriber.on('pmessage', (pattern, channel, message) => {
      try {
        const data = JSON.parse(message);
        
        // channel format: market:orderbook:BTC-USD or market:trades:BTC-USD or market:system:subscriptions
        const parts = channel.split(':');
        
        if (parts[1] === 'system' && parts[2] === 'subscriptions') {
            this.broadcastAll({ type: 'system_status', channels: data.channels });
        } else {
            const productId = parts[parts.length - 1]; // Last part is always productId
            if (productId) {
            this.fanout(productId, data);
            }
        }
      } catch (error) {
        logger.error(`Error parsing pmessage from channel ${channel}:`, error);
      }
    });
  }
}

export const wsGateway = new WebSocketGateway();
