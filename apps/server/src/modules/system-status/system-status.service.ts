import type { CoinbaseStatus } from '../coinbase/coinbase.types';
import type { SystemStatusState } from './system-status.types';
import { systemStatusRepository } from './system-status.repository';

export class SystemStatusService {
  private state: SystemStatusState = {
    coinbaseConnected: false,
    activeChannels: [],
    reconnectAttempts: 0,
    lastUpdate: new Date(),
  };

  public updateCoinbaseStatus(status: CoinbaseStatus) {
    this.state.activeChannels = status.products || [];
    this.state.lastUpdate = new Date();
  }

  public setConnectionState(connected: boolean) {
    this.state.coinbaseConnected = connected;
    this.state.lastUpdate = new Date();
    
    systemStatusRepository.logEvent(
      'COINBASE_CONNECTION', 
      connected ? 'Connected to Coinbase WS' : 'Disconnected from Coinbase WS'
    );
  }

  public incrementReconnects() {
    this.state.reconnectAttempts++;
  }

  public getStatus() {
    return this.state;
  }
}

export const systemStatusService = new SystemStatusService();
