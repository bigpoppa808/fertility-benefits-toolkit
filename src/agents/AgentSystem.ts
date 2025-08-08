import { EventBus } from './communication/EventBus';
import { ResearchAgent } from './research/ResearchAgent';
import { PlanningAgent } from './planning/PlanningAgent';
import { DataSource, AgentMetrics } from './types';

export class AgentSystem {
  private eventBus: EventBus;
  private researchAgent: ResearchAgent;
  private planningAgent: PlanningAgent;
  private isRunning: boolean = false;
  private startTime: Date = new Date();

  constructor() {
    // Initialize event bus
    this.eventBus = new EventBus();
    
    // Configure data sources for research agent
    const dataSources: DataSource[] = [
      {
        name: 'CDC ART Reports',
        type: 'api',
        url: 'https://api.cdc.gov/art',
        update_interval: 1440, // Daily
      },
      {
        name: 'Congress.gov',
        type: 'web',
        url: 'https://www.congress.gov',
        update_interval: 60, // Hourly
      },
      {
        name: 'Market Intelligence',
        type: 'database',
        update_interval: 720, // Twice daily
      }
    ];
    
    // Initialize agents
    this.researchAgent = new ResearchAgent(this.eventBus, dataSources);
    this.planningAgent = new PlanningAgent(this.eventBus);
    
    // Set up inter-agent communication
    this.setupCommunication();
  }

  private setupCommunication(): void {
    // Log all events for monitoring
    const events = [
      'research.finding',
      'planning.plan_created',
      'implementation.status',
      'validation.request',
      'validation.response'
    ];
    
    events.forEach(event => {
      this.eventBus.subscribe(event, (data) => {
        console.log(`[AgentSystem] Event: ${event}`, data);
        this.logEvent(event, data);
      });
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Agent system is already running');
      return;
    }
    
    console.log('Starting Agent System...');
    this.isRunning = true;
    this.startTime = new Date();
    
    try {
      // Start all agents
      await Promise.all([
        this.researchAgent.start(),
        this.planningAgent.start()
      ]);
      
      console.log('Agent System started successfully');
      
      // Start monitoring
      this.startMonitoring();
      
    } catch (error) {
      console.error('Failed to start Agent System:', error);
      this.isRunning = false;
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('Agent system is not running');
      return;
    }
    
    console.log('Stopping Agent System...');
    
    try {
      // Stop all agents
      await Promise.all([
        this.researchAgent.stop(),
        this.planningAgent.stop()
      ]);
      
      this.isRunning = false;
      console.log('Agent System stopped');
      
    } catch (error) {
      console.error('Error stopping Agent System:', error);
      throw error;
    }
  }

  private startMonitoring(): void {
    // Monitor system health every minute
    setInterval(() => {
      if (this.isRunning) {
        this.checkSystemHealth();
      }
    }, 60000);
  }

  private checkSystemHealth(): void {
    const metrics = this.getSystemMetrics();
    
    // Check for degraded agents
    const degradedAgents = metrics.agents.filter(a => a.health_status === 'degraded');
    const criticalAgents = metrics.agents.filter(a => a.health_status === 'critical');
    
    if (criticalAgents.length > 0) {
      console.error('Critical: Agents in critical state:', criticalAgents.map(a => a.agent_id));
      this.handleCriticalState(criticalAgents);
    } else if (degradedAgents.length > 0) {
      console.warn('Warning: Agents in degraded state:', degradedAgents.map(a => a.agent_id));
    }
    
    // Log metrics
    console.log('System Metrics:', {
      uptime: metrics.uptime,
      total_findings: metrics.total_findings,
      active_plans: metrics.active_plans,
      health: metrics.overall_health
    });
  }

  private handleCriticalState(criticalAgents: AgentMetrics[]): void {
    // Implement recovery strategies
    for (const agent of criticalAgents) {
      if (agent.error_rate > 0.5) {
        console.log(`Attempting to restart ${agent.agent_id}`);
        // In a real implementation, we would restart the specific agent
      }
    }
  }

  public getSystemMetrics(): {
    uptime: number;
    agents: AgentMetrics[];
    total_findings: number;
    active_plans: number;
    message_count: number;
    overall_health: 'healthy' | 'degraded' | 'critical';
  } {
    const agents = [
      this.researchAgent.getMetrics(),
      this.planningAgent.getMetrics()
    ];
    
    const overallHealth = agents.some(a => a.health_status === 'critical') 
      ? 'critical'
      : agents.some(a => a.health_status === 'degraded')
        ? 'degraded'
        : 'healthy';
    
    return {
      uptime: Date.now() - this.startTime.getTime(),
      agents,
      total_findings: this.researchAgent.getFindings().length,
      active_plans: this.planningAgent.getActivePlans().length,
      message_count: this.eventBus.getMessageHistory().length,
      overall_health: overallHealth
    };
  }

  public async triggerManualScan(): Promise<void> {
    console.log('Triggering manual scan...');
    
    // Publish event to trigger research scan
    await this.eventBus.publish('manual.scan_request', {
      requested_by: 'user',
      timestamp: new Date()
    });
  }

  public async createManualPlan(findingIds: string[]): Promise<void> {
    console.log('Creating manual plan for findings:', findingIds);
    
    // Get findings by IDs
    const allFindings = this.researchAgent.getFindings();
    const selectedFindings = allFindings.filter(f => findingIds.includes(f.id));
    
    if (selectedFindings.length === 0) {
      console.error('No valid findings found');
      return;
    }
    
    // Publish findings for planning
    for (const finding of selectedFindings) {
      await this.eventBus.publish('research.finding', {
        finding,
        agent_id: 'manual',
        timestamp: new Date()
      });
    }
  }

  public getEventHistory(filter?: any): any[] {
    return this.eventBus.getMessageHistory(filter);
  }

  private logEvent(event: string, data: any): void {
    // In a real implementation, this would log to a database or file
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      data: JSON.stringify(data).substring(0, 200) // Truncate for logging
    };
    
    // console.log('[EventLog]', logEntry);
  }

  public isSystemRunning(): boolean {
    return this.isRunning;
  }
}

// Export singleton instance
export const agentSystem = new AgentSystem();