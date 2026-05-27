export interface SystemStatusState {
  coinbaseConnected: boolean;
  activeChannels: Record<string, unknown>[];
  reconnectAttempts: number;
  lastUpdate: Date;
}
