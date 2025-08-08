import { 
  Finding, 
  RevisionPlan, 
  Phase, 
  Task, 
  Priority,
  RiskAssessment,
  AgentMetrics,
  Metric
} from '../types';
import { EventBus } from '../communication/EventBus';
import { ImpactAnalyzer } from './ImpactAnalyzer';
import { DependencyManager } from './DependencyManager';
import { ResourceAllocator } from './ResourceAllocator';

export class PlanningAgent {
  private eventBus: EventBus;
  private impactAnalyzer: ImpactAnalyzer;
  private dependencyManager: DependencyManager;
  private resourceAllocator: ResourceAllocator;
  private activePlans: Map<string, RevisionPlan> = new Map();
  private planQueue: Finding[] = [];
  private isProcessing: boolean = false;
  private metrics: AgentMetrics;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.impactAnalyzer = new ImpactAnalyzer();
    this.dependencyManager = new DependencyManager();
    this.resourceAllocator = new ResourceAllocator();
    
    this.metrics = {
      agent_id: 'planning-agent',
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
    console.log('Planning Agent started');
    
    // Subscribe to research findings
    this.eventBus.subscribe('research.finding', this.handleFinding.bind(this));
    
    // Subscribe to implementation status updates
    this.eventBus.subscribe('implementation.status', this.handleImplementationStatus.bind(this));
    
    // Start processing queue
    this.startProcessing();
  }

  async stop(): Promise<void> {
    this.isProcessing = false;
    console.log('Planning Agent stopped');
  }

  private async handleFinding(data: any): Promise<void> {
    const { finding } = data;
    console.log(`Received finding: ${finding.title}`);
    
    // Add to queue for processing
    this.planQueue.push(finding);
    
    // Process immediately if critical
    if (finding.priority === 'critical') {
      await this.processFinding(finding);
    }
  }

  private async startProcessing(): Promise<void> {
    this.isProcessing = true;
    
    while (this.isProcessing) {
      if (this.planQueue.length > 0) {
        const findings = this.getBatchForProcessing();
        await this.createRevisionPlan(findings);
      }
      
      await this.delay(5000); // Check every 5 seconds
    }
  }

  private getBatchForProcessing(): Finding[] {
    // Group related findings for batch processing
    const batch: Finding[] = [];
    const maxBatchSize = 5;
    
    while (this.planQueue.length > 0 && batch.length < maxBatchSize) {
      const finding = this.planQueue.shift()!;
      
      // Check if finding can be batched with others
      if (batch.length === 0 || this.canBatch(finding, batch)) {
        batch.push(finding);
      } else {
        // Put it back for next batch
        this.planQueue.unshift(finding);
        break;
      }
    }
    
    return batch;
  }

  private canBatch(finding: Finding, batch: Finding[]): boolean {
    // Check if findings affect same components or are related
    const batchCategories = new Set(batch.map(f => f.category));
    const batchComponents = new Set(
      batch.flatMap(f => f.recommended_actions.map(a => this.extractComponent(a)))
    );
    
    const findingComponents = new Set(
      finding.recommended_actions.map(a => this.extractComponent(a))
    );
    
    // Batch if same category or overlapping components
    if (batchCategories.has(finding.category)) {
      return true;
    }
    
    for (const comp of findingComponents) {
      if (batchComponents.has(comp)) {
        return true;
      }
    }
    
    return false;
  }

  private extractComponent(action: string): string {
    // Extract component name from action string
    const components = ['ROI Calculator', 'Policy Tracker', 'Global Comparator', 'AI Dashboard'];
    
    for (const comp of components) {
      if (action.toLowerCase().includes(comp.toLowerCase())) {
        return comp;
      }
    }
    
    return 'General';
  }

  private async processFinding(finding: Finding): Promise<void> {
    await this.createRevisionPlan([finding]);
  }

  private async createRevisionPlan(findings: Finding[]): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`Creating revision plan for ${findings.length} findings`);
      
      // Analyze impact
      const impactScore = this.impactAnalyzer.analyze(findings);
      
      // Check dependencies
      const dependencies = this.dependencyManager.analyzeDependencies(findings);
      
      // Create phases
      const phases = this.createPhases(findings, dependencies);
      
      // Allocate resources
      const resourcePlan = this.resourceAllocator.allocate(phases);
      
      // Assess risks
      const riskAssessment = this.assessRisks(findings, phases);
      
      // Define success metrics
      const successMetrics = this.defineSuccessMetrics(findings);
      
      // Create plan
      const plan: RevisionPlan = {
        plan_id: this.generatePlanId(),
        created_date: new Date(),
        status: 'draft',
        findings,
        phases,
        total_effort: this.calculateTotalEffort(phases),
        risk_assessment: riskAssessment,
        success_metrics: successMetrics,
        deadline: this.calculateDeadline(findings)
      };
      
      // Validate plan
      if (this.validatePlan(plan)) {
        // Store plan
        this.activePlans.set(plan.plan_id, plan);
        
        // Publish plan for implementation
        await this.publishPlan(plan);
        
        this.metrics.tasks_completed++;
      } else {
        console.error('Plan validation failed');
        this.metrics.tasks_failed++;
      }
      
      this.updateAverageTaskTime(Date.now() - startTime);
      
    } catch (error) {
      console.error('Error creating revision plan:', error);
      this.metrics.tasks_failed++;
      this.updateErrorRate();
    }
  }

  private createPhases(findings: Finding[], dependencies: Map<string, string[]>): Phase[] {
    const phases: Phase[] = [];
    const processedTasks = new Set<string>();
    
    // Phase 1: Critical and independent tasks
    const phase1Tasks = this.getIndependentTasks(findings, dependencies);
    if (phase1Tasks.length > 0) {
      phases.push({
        phase_number: 1,
        title: 'Critical Updates',
        objectives: ['Address critical findings', 'Update compliance requirements'],
        tasks: phase1Tasks,
        dependencies: [],
        duration: this.estimatePhaseDuration(phase1Tasks),
        resources_required: this.estimateResources(phase1Tasks)
      });
      
      phase1Tasks.forEach(t => processedTasks.add(t.id));
    }
    
    // Phase 2: Dependent tasks
    const phase2Tasks = this.getDependentTasks(findings, dependencies, processedTasks);
    if (phase2Tasks.length > 0) {
      phases.push({
        phase_number: 2,
        title: 'Feature Updates',
        objectives: ['Implement new features', 'Update calculations'],
        tasks: phase2Tasks,
        dependencies: phase1Tasks.map(t => t.id),
        duration: this.estimatePhaseDuration(phase2Tasks),
        resources_required: this.estimateResources(phase2Tasks)
      });
      
      phase2Tasks.forEach(t => processedTasks.add(t.id));
    }
    
    // Phase 3: Testing and validation
    const phase3Tasks = this.createTestingTasks(findings);
    phases.push({
      phase_number: 3,
      title: 'Testing & Validation',
      objectives: ['Validate all changes', 'Ensure quality standards'],
      tasks: phase3Tasks,
      dependencies: Array.from(processedTasks),
      duration: 3, // days
      resources_required: [
        { type: 'human', name: 'QA Engineer', quantity: 1, availability: 'scheduled' }
      ]
    });
    
    return phases;
  }

  private getIndependentTasks(findings: Finding[], dependencies: Map<string, string[]>): Task[] {
    const tasks: Task[] = [];
    
    for (const finding of findings) {
      if (finding.priority === 'critical' || finding.priority === 'high') {
        for (const action of finding.recommended_actions) {
          const task: Task = {
            id: this.generateTaskId(),
            type: this.determineTaskType(action),
            title: action,
            description: `Implement: ${action}`,
            component: this.extractComponent(action),
            priority: this.getPriorityScore(finding.priority),
            estimated_hours: this.estimateHours(action),
            status: 'pending',
            changes: [],
            tests: []
          };
          
          tasks.push(task);
        }
      }
    }
    
    return tasks;
  }

  private getDependentTasks(
    findings: Finding[], 
    dependencies: Map<string, string[]>,
    processedTasks: Set<string>
  ): Task[] {
    const tasks: Task[] = [];
    
    for (const finding of findings) {
      if (finding.priority === 'medium' || finding.priority === 'low') {
        for (const action of finding.recommended_actions) {
          const task: Task = {
            id: this.generateTaskId(),
            type: this.determineTaskType(action),
            title: action,
            description: `Implement: ${action}`,
            component: this.extractComponent(action),
            priority: this.getPriorityScore(finding.priority),
            estimated_hours: this.estimateHours(action),
            status: 'pending',
            changes: [],
            tests: []
          };
          
          if (!processedTasks.has(task.id)) {
            tasks.push(task);
          }
        }
      }
    }
    
    return tasks;
  }

  private createTestingTasks(findings: Finding[]): Task[] {
    const components = new Set<string>();
    
    for (const finding of findings) {
      for (const action of finding.recommended_actions) {
        components.add(this.extractComponent(action));
      }
    }
    
    return Array.from(components).map(component => ({
      id: this.generateTaskId(),
      type: 'feature' as const,
      title: `Test ${component}`,
      description: `Comprehensive testing of ${component} changes`,
      component,
      priority: 10,
      estimated_hours: 4,
      status: 'pending' as const,
      changes: [],
      tests: [
        {
          test_type: 'unit' as const,
          scope: [component],
          success_criteria: [
            { metric: 'coverage', operator: '>=', value: 90 },
            { metric: 'pass_rate', operator: '=', value: 100 }
          ],
          timeout: 300000
        },
        {
          test_type: 'integration' as const,
          scope: [component],
          success_criteria: [
            { metric: 'pass_rate', operator: '>=', value: 95 }
          ],
          timeout: 600000
        }
      ]
    }));
  }

  private assessRisks(findings: Finding[], phases: Phase[]): RiskAssessment {
    const risks = [];
    
    // Data integrity risk
    if (findings.some(f => f.category === 'scientific')) {
      risks.push({
        type: 'data_integrity',
        probability: 'medium' as const,
        impact: 'high' as const,
        description: 'Incorrect data updates could affect calculations',
        mitigation: 'Implement comprehensive validation and testing'
      });
    }
    
    // Compliance risk
    if (findings.some(f => f.category === 'legislative')) {
      risks.push({
        type: 'compliance',
        probability: 'low' as const,
        impact: 'high' as const,
        description: 'Missing regulatory requirements',
        mitigation: 'Legal review and compliance testing'
      });
    }
    
    // Timeline risk
    if (phases.reduce((sum, p) => sum + p.duration, 0) > 14) {
      risks.push({
        type: 'timeline',
        probability: 'medium' as const,
        impact: 'medium' as const,
        description: 'Extended implementation timeline',
        mitigation: 'Parallel execution and resource augmentation'
      });
    }
    
    const overallRisk = risks.some(r => r.probability === 'high' && r.impact === 'high') 
      ? 'high' 
      : risks.some(r => r.impact === 'high') 
        ? 'medium' 
        : 'low';
    
    return {
      risks,
      overall_risk_level: overallRisk,
      mitigation_strategies: risks.map(r => r.mitigation)
    };
  }

  private defineSuccessMetrics(findings: Finding[]): Metric[] {
    const metrics: Metric[] = [
      {
        name: 'Implementation Completion',
        target: 100,
        unit: '%',
        measurement_method: 'Completed tasks / Total tasks'
      },
      {
        name: 'Test Pass Rate',
        target: 95,
        unit: '%',
        measurement_method: 'Passed tests / Total tests'
      },
      {
        name: 'Data Accuracy',
        target: 99,
        unit: '%',
        measurement_method: 'Validated data points / Total data points'
      }
    ];
    
    // Add specific metrics based on findings
    if (findings.some(f => f.category === 'legislative')) {
      metrics.push({
        name: 'Compliance Coverage',
        target: 100,
        unit: '%',
        measurement_method: 'Compliant features / Required features'
      });
    }
    
    if (findings.some(f => f.category === 'market')) {
      metrics.push({
        name: 'Feature Parity',
        target: 90,
        unit: '%',
        measurement_method: 'Implemented features / Competitor features'
      });
    }
    
    return metrics;
  }

  private calculateTotalEffort(phases: Phase[]): number {
    return phases.reduce((total, phase) => {
      const phaseEffort = phase.tasks.reduce((sum, task) => sum + task.estimated_hours, 0);
      return total + phaseEffort;
    }, 0);
  }

  private calculateDeadline(findings: Finding[]): Date | undefined {
    // Check for legislative deadlines
    for (const finding of findings) {
      if (finding.category === 'legislative' && finding.data?.implementation_deadline) {
        return new Date(finding.data.implementation_deadline);
      }
    }
    
    // Default to 30 days for high priority items
    if (findings.some(f => f.priority === 'critical' || f.priority === 'high')) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30);
      return deadline;
    }
    
    return undefined;
  }

  private validatePlan(plan: RevisionPlan): boolean {
    // Validate plan has phases
    if (plan.phases.length === 0) {
      console.error('Plan has no phases');
      return false;
    }
    
    // Validate each phase has tasks
    for (const phase of plan.phases) {
      if (phase.tasks.length === 0) {
        console.error(`Phase ${phase.phase_number} has no tasks`);
        return false;
      }
    }
    
    // Validate effort is reasonable
    if (plan.total_effort > 500) {
      console.warn('Plan requires excessive effort');
    }
    
    // Validate dependencies are valid
    const allTaskIds = new Set(
      plan.phases.flatMap(p => p.tasks.map(t => t.id))
    );
    
    for (const phase of plan.phases) {
      for (const dep of phase.dependencies) {
        if (!allTaskIds.has(dep)) {
          console.error(`Invalid dependency: ${dep}`);
          return false;
        }
      }
    }
    
    return true;
  }

  private async publishPlan(plan: RevisionPlan): Promise<void> {
    console.log(`Publishing plan ${plan.plan_id}`);
    
    // Update status
    plan.status = 'approved';
    this.activePlans.set(plan.plan_id, plan);
    
    // Publish to event bus
    await this.eventBus.publish('planning.plan_created', {
      plan,
      agent_id: this.metrics.agent_id,
      timestamp: new Date()
    });
  }

  private async handleImplementationStatus(data: any): Promise<void> {
    const { plan_id, status, completed_tasks } = data;
    
    const plan = this.activePlans.get(plan_id);
    if (!plan) {
      console.error(`Plan ${plan_id} not found`);
      return;
    }
    
    // Update plan status
    if (status === 'completed') {
      plan.status = 'completed';
      console.log(`Plan ${plan_id} completed successfully`);
    } else if (status === 'failed') {
      plan.status = 'draft';
      console.log(`Plan ${plan_id} failed, reverting to draft`);
    } else {
      plan.status = 'in_progress';
    }
    
    this.activePlans.set(plan_id, plan);
  }

  private determineTaskType(action: string): 'data_update' | 'feature' | 'bugfix' | 'refactor' {
    if (action.toLowerCase().includes('update') || action.toLowerCase().includes('modify')) {
      return 'data_update';
    }
    if (action.toLowerCase().includes('add') || action.toLowerCase().includes('create')) {
      return 'feature';
    }
    if (action.toLowerCase().includes('fix')) {
      return 'bugfix';
    }
    return 'refactor';
  }

  private getPriorityScore(priority: Priority): number {
    switch (priority) {
      case 'critical': return 10;
      case 'high': return 7;
      case 'medium': return 5;
      case 'low': return 3;
      default: return 1;
    }
  }

  private estimateHours(action: string): number {
    // Simple estimation based on action complexity
    if (action.includes('update') || action.includes('modify')) {
      return 2;
    }
    if (action.includes('create') || action.includes('implement')) {
      return 8;
    }
    if (action.includes('refactor') || action.includes('optimize')) {
      return 16;
    }
    return 4;
  }

  private estimatePhaseDuration(tasks: Task[]): number {
    const totalHours = tasks.reduce((sum, t) => sum + t.estimated_hours, 0);
    // Assume 8 hours per day, with some parallelization
    return Math.ceil(totalHours / 16);
  }

  private estimateResources(tasks: Task[]): any[] {
    const resources = [];
    const totalHours = tasks.reduce((sum, t) => sum + t.estimated_hours, 0);
    
    if (totalHours > 0) {
      resources.push({
        type: 'human',
        name: 'Developer',
        quantity: Math.ceil(totalHours / 40), // Number of developers needed
        availability: 'available'
      });
    }
    
    return resources;
  }

  private generatePlanId(): string {
    return `PLAN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTaskId(): string {
    return `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

  public getActivePlans(): RevisionPlan[] {
    return Array.from(this.activePlans.values());
  }
}