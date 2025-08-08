import { AgentMessage } from '../types';

type EventHandler = (data: any) => void | Promise<void>;

export class EventBus {
  private subscribers: Map<string, EventHandler[]> = new Map();
  private messageQueue: AgentMessage[] = [];
  private isProcessing: boolean = false;
  private messageHistory: AgentMessage[] = [];
  private maxHistorySize: number = 1000;

  subscribe(event: string, handler: EventHandler): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    
    this.subscribers.get(event)!.push(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.subscribers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  async publish(event: string, data: any): Promise<void> {
    console.log(`[EventBus] Publishing event: ${event}`);
    
    // Add to message history
    const message: AgentMessage = {
      id: this.generateMessageId(),
      sender: data.agent_id || 'unknown',
      recipient: 'broadcast',
      timestamp: new Date(),
      message_type: this.getMessageType(event),
      priority: data.priority || 'medium',
      payload: data,
      correlation_id: data.correlation_id || this.generateCorrelationId(),
      requires_response: data.requires_response || false
    };
    
    this.addToHistory(message);
    
    // Get handlers for this event
    const handlers = this.subscribers.get(event) || [];
    
    // Execute handlers
    const promises = handlers.map(handler => {
      try {
        return Promise.resolve(handler(data));
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${event}:`, error);
        return Promise.reject(error);
      }
    });
    
    // Wait for all handlers to complete
    await Promise.allSettled(promises);
  }

  async publishMessage(message: AgentMessage): Promise<void> {
    // Add to queue for processing
    this.messageQueue.push(message);
    this.addToHistory(message);
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      
      try {
        // Route message based on type
        const eventName = this.getEventName(message);
        await this.publish(eventName, message.payload);
      } catch (error) {
        console.error('[EventBus] Error processing message:', error);
      }
    }
    
    this.isProcessing = false;
  }

  private getEventName(message: AgentMessage): string {
    return `${message.sender}.${message.message_type}`;
  }

  private getMessageType(event: string): any {
    const parts = event.split('.');
    return parts[parts.length - 1] as any;
  }

  private generateMessageId(): string {
    return `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `CORR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private addToHistory(message: AgentMessage): void {
    this.messageHistory.push(message);
    
    // Trim history if it exceeds max size
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory.shift();
    }
  }

  public getMessageHistory(filter?: {
    sender?: string;
    recipient?: string;
    type?: string;
    since?: Date;
  }): AgentMessage[] {
    let history = [...this.messageHistory];
    
    if (filter) {
      if (filter.sender) {
        history = history.filter(m => m.sender === filter.sender);
      }
      if (filter.recipient) {
        history = history.filter(m => m.recipient === filter.recipient);
      }
      if (filter.type) {
        history = history.filter(m => m.message_type === filter.type);
      }
      if (filter.since) {
        history = history.filter(m => m.timestamp > filter.since);
      }
    }
    
    return history;
  }

  public clearHistory(): void {
    this.messageHistory = [];
  }

  public getSubscriberCount(event: string): number {
    return this.subscribers.get(event)?.length || 0;
  }

  public getAllEvents(): string[] {
    return Array.from(this.subscribers.keys());
  }
}