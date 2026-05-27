export class SubscriptionRegistry {
  // clientId -> Set of productIds
  private clientSubscriptions: Map<string, Set<string>> = new Map();
  // productId -> Set of clientIds
  private productSubscribers: Map<string, Set<string>> = new Map();

  public subscribe(clientId: string, productId: string) {
    if (!this.clientSubscriptions.has(clientId)) {
      this.clientSubscriptions.set(clientId, new Set());
    }
    this.clientSubscriptions.get(clientId)!.add(productId);

    if (!this.productSubscribers.has(productId)) {
      this.productSubscribers.set(productId, new Set());
    }
    this.productSubscribers.get(productId)!.add(clientId);
  }

  public unsubscribe(clientId: string, productId: string) {
    this.clientSubscriptions.get(clientId)?.delete(productId);
    this.productSubscribers.get(productId)?.delete(clientId);

    if (this.productSubscribers.get(productId)?.size === 0) {
      this.productSubscribers.delete(productId);
    }
  }

  public unsubscribeAll(clientId: string) {
    const products = this.clientSubscriptions.get(clientId);
    if (products) {
      for (const productId of products) {
        this.unsubscribe(clientId, productId);
      }
    }
    this.clientSubscriptions.delete(clientId);
  }

  public getSubscribers(productId: string): Set<string> {
    return this.productSubscribers.get(productId) || new Set();
  }

  public getSubscriptions(clientId: string): Set<string> {
    return this.clientSubscriptions.get(clientId) || new Set();
  }
}
