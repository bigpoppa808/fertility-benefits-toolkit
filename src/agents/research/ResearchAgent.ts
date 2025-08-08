import { Finding, Priority, DataSource, AgentMetrics } from '../types';
import { EventBus } from '../communication/EventBus';
import { DataValidator } from './DataValidator';
import { LegislativeTracker } from './LegislativeTracker';
import { MarketAnalyzer } from './MarketAnalyzer';

export class ResearchAgent {
  private eventBus: EventBus;
  private validator: DataValidator;
  private legislativeTracker: LegislativeTracker;
  private marketAnalyzer: MarketAnalyzer;
  private dataSources: DataSource[];
  private findings: Finding[] = [];
  private isRunning: boolean = false;
  private lastScan: Date = new Date();
  private metrics: AgentMetrics;

  constructor(eventBus: EventBus, dataSources: DataSource[]) {
    this.eventBus = eventBus;
    this.dataSources = dataSources;
    this.validator = new DataValidator();
    this.legislativeTracker = new LegislativeTracker();
    this.marketAnalyzer = new MarketAnalyzer();
    
    this.metrics = {
      agent_id: 'research-agent',
      uptime: 0,
      tasks_completed: 0,
      tasks_failed: 0,
      average_task_time: 0,
      error_rate: 0,
      last_activity: new Date(),
      health_status: 'healthy'
    };
  }

  async start(): Promise<void> {
    this.isRunning = true;
    console.log('Research Agent started');
    
    // Start continuous monitoring
    this.startMonitoring();
    
    // Subscribe to validation requests
    this.eventBus.subscribe('validation.request', this.handleValidationRequest.bind(this));
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    console.log('Research Agent stopped');
  }

  private async startMonitoring(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.performScan();
        await this.delay(60000); // Wait 1 minute between scans
      } catch (error) {
        console.error('Error during scan:', error);
        this.metrics.tasks_failed++;
        this.updateErrorRate();
      }
    }
  }

  private async performScan(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Scan all data sources
      const scanResults = await Promise.all([
        this.scanScientificResearch(),
        this.scanLegislativeUpdates(),
        this.scanMarketTrends(),
        this.scanCompetitorData()
      ]);

      // Process and validate findings
      const newFindings = this.processFindings(scanResults.flat());
      
      // Publish significant findings
      for (const finding of newFindings) {
        if (this.isSignificant(finding)) {
          await this.publishFinding(finding);
        }
      }

      this.lastScan = new Date();
      this.metrics.tasks_completed++;
      this.updateAverageTaskTime(Date.now() - startTime);
      
    } catch (error) {
      console.error('Scan failed:', error);
      throw error;
    }
  }

  private async scanScientificResearch(): Promise<Finding[]> {
    const findings: Finding[] = [];
    
    // Simulate scanning PubMed and other scientific sources
    const researchData = await this.fetchFromSource('pubmed');
    
    if (researchData) {
      const finding: Finding = {
        id: this.generateId(),
        source: 'PubMed',
        category: 'scientific',
        title: 'Updated IVF Success Rates 2025',
        description: 'New study shows improved success rates for IVF treatments',
        key_points: [
          'Success rate increased to 55% for women under 35',
          'Frozen embryo transfers show 5% higher success',
          'PGT-A testing improves outcomes by 10%'
        ],
        impact: 'Update ROI calculator success rate parameters',
        priority: 'high',
        confidence_score: 0.95,
        data: {
          success_rate_under_35: 0.55,
          success_rate_35_37: 0.42,
          success_rate_38_40: 0.31,
          success_rate_over_40: 0.12
        },
        recommended_actions: [
          'Update success rate constants in ROI calculator',
          'Revise age-based calculations',
          'Update documentation with new statistics'
        ],
        validation_required: true,
        created_at: new Date()
      };
      
      findings.push(finding);
    }
    
    return findings;
  }

  private async scanLegislativeUpdates(): Promise<Finding[]> {
    const findings: Finding[] = [];
    
    // Check for legislative updates
    const updates = await this.legislativeTracker.checkUpdates();
    
    for (const update of updates) {
      const finding: Finding = {
        id: this.generateId(),
        source: 'Congress.gov',
        category: 'legislative',
        title: update.title,
        description: update.description,
        key_points: update.keyPoints,
        impact: update.impact,
        priority: this.assessLegislativePriority(update),
        confidence_score: 1.0,
        data: update.data,
        recommended_actions: update.actions,
        validation_required: false,
        created_at: new Date()
      };
      
      findings.push(finding);
    }
    
    return findings;
  }

  private async scanMarketTrends(): Promise<Finding[]> {
    const findings: Finding[] = [];
    
    // Analyze market trends
    const trends = await this.marketAnalyzer.analyzeTrends();
    
    for (const trend of trends) {
      if (trend.significance > 0.7) {
        const finding: Finding = {
          id: this.generateId(),
          source: trend.source,
          category: 'market',
          title: trend.title,
          description: trend.description,
          key_points: trend.insights,
          impact: trend.businessImpact,
          priority: trend.significance > 0.9 ? 'high' : 'medium',
          confidence_score: trend.confidence,
          data: trend.data,
          recommended_actions: trend.recommendations,
          validation_required: true,
          created_at: new Date()
        };
        
        findings.push(finding);
      }
    }
    
    return findings;
  }

  private async scanCompetitorData(): Promise<Finding[]> {
    const findings: Finding[] = [];
    
    // Simulate competitor analysis
    const competitorData = {
      carrot_fertility: {
        new_features: ['AI-powered fertility coaching'],
        pricing_changes: { enterprise: '+5%' },
        market_expansion: ['Canada', 'UK']
      },
      progyny: {
        new_partnerships: ['Anthem', 'Cigna'],
        service_updates: ['Expanded surrogacy support']
      }
    };
    
    if (Object.keys(competitorData).length > 0) {
      const finding: Finding = {
        id: this.generateId(),
        source: 'Market Intelligence',
        category: 'market',
        title: 'Competitor Updates Q1 2025',
        description: 'Key competitors have announced new features and partnerships',
        key_points: [
          'Carrot Fertility launches AI coaching',
          'Progyny expands insurance partnerships',
          'Market seeing 5% average price increase'
        ],
        impact: 'Consider feature parity and pricing strategy',
        priority: 'medium',
        confidence_score: 0.85,
        data: competitorData,
        recommended_actions: [
          'Evaluate AI integration opportunities',
          'Review pricing competitiveness',
          'Consider partnership expansion'
        ],
        validation_required: false,
        created_at: new Date()
      };
      
      findings.push(finding);
    }
    
    return findings;
  }

  private processFindings(rawFindings: Finding[]): Finding[] {
    // Deduplicate findings
    const uniqueFindings = this.deduplicateFindings(rawFindings);
    
    // Validate data accuracy
    const validatedFindings = uniqueFindings.map(finding => {
      if (finding.validation_required) {
        finding.confidence_score = this.validator.validateFinding(finding);
      }
      return finding;
    });
    
    // Filter by confidence threshold
    return validatedFindings.filter(f => f.confidence_score > 0.7);
  }

  private deduplicateFindings(findings: Finding[]): Finding[] {
    const seen = new Set<string>();
    return findings.filter(finding => {
      const key = `${finding.source}-${finding.title}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private isSignificant(finding: Finding): boolean {
    // Determine if finding is significant enough to publish
    if (finding.priority === 'critical' || finding.priority === 'high') {
      return true;
    }
    
    if (finding.category === 'legislative' && finding.confidence_score > 0.9) {
      return true;
    }
    
    if (finding.impact && finding.impact.includes('compliance')) {
      return true;
    }
    
    return finding.confidence_score > 0.85 && finding.priority !== 'low';
  }

  private async publishFinding(finding: Finding): Promise<void> {
    console.log(`Publishing finding: ${finding.title}`);
    
    this.findings.push(finding);
    
    // Publish to event bus for planning agent
    this.eventBus.publish('research.finding', {
      finding,
      timestamp: new Date(),
      agent_id: this.metrics.agent_id
    });
    
    // Store in database
    await this.storeFinding(finding);
  }

  private async storeFinding(finding: Finding): Promise<void> {
    // Simulate database storage
    console.log(`Storing finding ${finding.id} in database`);
  }

  private async fetchFromSource(source: string): Promise<any> {
    // Simulate API call to data source
    console.log(`Fetching data from ${source}`);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ data: 'mock data' });
      }, 100);
    });
  }

  private async handleValidationRequest(request: any): Promise<void> {
    const { data_point, current_value, component } = request.payload;
    
    console.log(`Validating ${data_point} for ${component}`);
    
    // Perform validation
    const validationResult = await this.validator.validateDataPoint(
      data_point,
      current_value
    );
    
    // Send response
    this.eventBus.publish('validation.response', {
      request_id: request.correlation_id,
      valid: validationResult.isValid,
      confidence: validationResult.confidence,
      suggested_value: validationResult.suggestedValue,
      sources: validationResult.sources
    });
  }

  private assessLegislativePriority(update: any): Priority {
    if (update.effectiveDate && this.daysBetween(new Date(), update.effectiveDate) < 30) {
      return 'critical';
    }
    
    if (update.impact.includes('mandate') || update.impact.includes('compliance')) {
      return 'high';
    }
    
    if (update.scope === 'federal') {
      return 'high';
    }
    
    return 'medium';
  }

  private generateId(): string {
    return `F-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private daysBetween(date1: Date, date2: Date): number {
    const diff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private updateAverageTaskTime(duration: number): void {
    const total = this.metrics.average_task_time * (this.metrics.tasks_completed - 1);
    this.metrics.average_task_time = (total + duration) / this.metrics.tasks_completed;
  }

  private updateErrorRate(): void {
    const total = this.metrics.tasks_completed + this.metrics.tasks_failed;
    this.metrics.error_rate = this.metrics.tasks_failed / total;
    
    if (this.metrics.error_rate > 0.1) {
      this.metrics.health_status = 'degraded';
    }
    if (this.metrics.error_rate > 0.25) {
      this.metrics.health_status = 'critical';
    }
  }

  public getMetrics(): AgentMetrics {
    return { ...this.metrics };
  }

  public getFindings(): Finding[] {
    return [...this.findings];
  }
}