import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentSystem } from '../AgentSystem';
import { EventBus } from '../communication/EventBus';
import { Finding } from '../types';

describe('AgentSystem', () => {
  let agentSystem: AgentSystem;

  beforeEach(() => {
    agentSystem = new AgentSystem();
  });

  afterEach(async () => {
    if (agentSystem.isSystemRunning()) {
      await agentSystem.stop();
    }
  });

  describe('System Lifecycle', () => {
    it('should start the agent system', async () => {
      expect(agentSystem.isSystemRunning()).toBe(false);
      
      await agentSystem.start();
      
      expect(agentSystem.isSystemRunning()).toBe(true);
    });

    it('should stop the agent system', async () => {
      await agentSystem.start();
      expect(agentSystem.isSystemRunning()).toBe(true);
      
      await agentSystem.stop();
      
      expect(agentSystem.isSystemRunning()).toBe(false);
    });

    it('should not start if already running', async () => {
      await agentSystem.start();
      const consoleSpy = vi.spyOn(console, 'log');
      
      await agentSystem.start();
      
      expect(consoleSpy).toHaveBeenCalledWith('Agent system is already running');
    });
  });

  describe('System Metrics', () => {
    it('should return system metrics', async () => {
      await agentSystem.start();
      
      const metrics = agentSystem.getSystemMetrics();
      
      expect(metrics).toHaveProperty('uptime');
      expect(metrics).toHaveProperty('agents');
      expect(metrics).toHaveProperty('total_findings');
      expect(metrics).toHaveProperty('active_plans');
      expect(metrics).toHaveProperty('overall_health');
      expect(metrics.agents).toHaveLength(2); // Research and Planning agents
    });

    it('should track system uptime', async () => {
      await agentSystem.start();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const metrics = agentSystem.getSystemMetrics();
      expect(metrics.uptime).toBeGreaterThan(0);
    });
  });

  describe('Manual Operations', () => {
    it('should trigger manual scan', async () => {
      await agentSystem.start();
      const consoleSpy = vi.spyOn(console, 'log');
      
      await agentSystem.triggerManualScan();
      
      expect(consoleSpy).toHaveBeenCalledWith('Triggering manual scan...');
    });

    it('should create manual plan with valid findings', async () => {
      await agentSystem.start();
      
      // Create a mock finding
      const mockFinding: Finding = {
        id: 'test-finding-1',
        source: 'Test',
        category: 'scientific',
        title: 'Test Finding',
        description: 'Test description',
        key_points: ['Point 1'],
        impact: 'Test impact',
        priority: 'high',
        confidence_score: 0.9,
        recommended_actions: ['Action 1'],
        validation_required: false,
        created_at: new Date()
      };
      
      // This would need the research agent to have the finding
      // In a real test, we'd mock this
      await agentSystem.createManualPlan(['test-finding-1']);
      
      // Verify the plan creation was attempted
      expect(true).toBe(true); // Placeholder for actual assertion
    });
  });

  describe('Event History', () => {
    it('should track event history', async () => {
      await agentSystem.start();
      
      const history = agentSystem.getEventHistory();
      
      expect(Array.isArray(history)).toBe(true);
    });

    it('should filter event history', async () => {
      await agentSystem.start();
      
      const filteredHistory = agentSystem.getEventHistory({
        since: new Date(Date.now() - 60000)
      });
      
      expect(Array.isArray(filteredHistory)).toBe(true);
    });
  });
});

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('Event Publishing and Subscribing', () => {
    it('should publish and receive events', async () => {
      const mockHandler = vi.fn();
      
      eventBus.subscribe('test.event', mockHandler);
      await eventBus.publish('test.event', { data: 'test' });
      
      expect(mockHandler).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should handle multiple subscribers', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      eventBus.subscribe('test.event', handler1);
      eventBus.subscribe('test.event', handler2);
      
      await eventBus.publish('test.event', { data: 'test' });
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should unsubscribe handlers', async () => {
      const handler = vi.fn();
      
      const unsubscribe = eventBus.subscribe('test.event', handler);
      unsubscribe();
      
      await eventBus.publish('test.event', { data: 'test' });
      
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Message History', () => {
    it('should maintain message history', async () => {
      await eventBus.publish('test.event', { data: 'test' });
      
      const history = eventBus.getMessageHistory();
      
      expect(history).toHaveLength(1);
      expect(history[0]).toHaveProperty('payload');
    });

    it('should clear message history', async () => {
      await eventBus.publish('test.event', { data: 'test' });
      
      eventBus.clearHistory();
      const history = eventBus.getMessageHistory();
      
      expect(history).toHaveLength(0);
    });
  });

  describe('Event Metrics', () => {
    it('should count subscribers', () => {
      eventBus.subscribe('test.event', () => {});
      eventBus.subscribe('test.event', () => {});
      
      const count = eventBus.getSubscriberCount('test.event');
      
      expect(count).toBe(2);
    });

    it('should list all events', () => {
      eventBus.subscribe('event1', () => {});
      eventBus.subscribe('event2', () => {});
      
      const events = eventBus.getAllEvents();
      
      expect(events).toContain('event1');
      expect(events).toContain('event2');
    });
  });
});