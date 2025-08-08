import { Phase, Resource } from '../types';

export interface ResourcePlan {
  phases: Map<number, Resource[]>;
  totalResources: Resource[];
  conflicts: ResourceConflict[];
  utilization: Map<string, number>;
}

export interface ResourceConflict {
  phase: number;
  resource: string;
  required: number;
  available: number;
  resolution: string;
}

export class ResourceAllocator {
  private availableResources: Map<string, Resource> = new Map();
  
  constructor() {
    this.initializeResources();
  }

  private initializeResources(): void {
    // Initialize available resources
    this.availableResources.set('developer', {
      type: 'human',
      name: 'Developer',
      quantity: 3,
      availability: 'available'
    });
    
    this.availableResources.set('qa-engineer', {
      type: 'human',
      name: 'QA Engineer',
      quantity: 2,
      availability: 'available'
    });
    
    this.availableResources.set('data-analyst', {
      type: 'human',
      name: 'Data Analyst',
      quantity: 1,
      availability: 'available'
    });
    
    this.availableResources.set('dev-server', {
      type: 'system',
      name: 'Development Server',
      quantity: 2,
      availability: 'available'
    });
    
    this.availableResources.set('test-environment', {
      type: 'system',
      name: 'Test Environment',
      quantity: 3,
      availability: 'available'
    });
  }

  allocate(phases: Phase[]): ResourcePlan {
    const plan: ResourcePlan = {
      phases: new Map(),
      totalResources: [],
      conflicts: [],
      utilization: new Map()
    };
    
    // Allocate resources for each phase
    for (const phase of phases) {
      const phaseResources = this.allocatePhaseResources(phase);
      plan.phases.set(phase.phase_number, phaseResources);
      
      // Check for conflicts
      const conflicts = this.checkResourceConflicts(phase, phaseResources);
      plan.conflicts.push(...conflicts);
    }
    
    // Calculate total resources needed
    plan.totalResources = this.calculateTotalResources(plan.phases);
    
    // Calculate utilization
    plan.utilization = this.calculateUtilization(phases, plan.phases);
    
    return plan;
  }

  private allocatePhaseResources(phase: Phase): Resource[] {
    const resources: Resource[] = [];
    const totalHours = phase.tasks.reduce((sum, task) => sum + task.estimated_hours, 0);
    
    // Allocate developers based on workload
    const developersNeeded = Math.ceil(totalHours / (40 * phase.duration / 5)); // 40 hours per week
    resources.push({
      type: 'human',
      name: 'Developer',
      quantity: Math.min(developersNeeded, 3), // Cap at available
      availability: 'scheduled'
    });
    
    // Allocate QA for testing phases
    if (phase.title.toLowerCase().includes('test') || phase.phase_number === 3) {
      resources.push({
        type: 'human',
        name: 'QA Engineer',
        quantity: 1,
        availability: 'scheduled'
      });
    }
    
    // Allocate data analyst for data-related tasks
    const hasDataTasks = phase.tasks.some(t => 
      t.type === 'data_update' || 
      t.title.toLowerCase().includes('data')
    );
    
    if (hasDataTasks) {
      resources.push({
        type: 'human',
        name: 'Data Analyst',
        quantity: 1,
        availability: 'scheduled'
      });
    }
    
    // Allocate system resources
    resources.push({
      type: 'system',
      name: 'Development Server',
      quantity: 1,
      availability: 'scheduled'
    });
    
    if (phase.title.toLowerCase().includes('test')) {
      resources.push({
        type: 'system',
        name: 'Test Environment',
        quantity: 2,
        availability: 'scheduled'
      });
    }
    
    return resources;
  }

  private checkResourceConflicts(phase: Phase, allocated: Resource[]): ResourceConflict[] {
    const conflicts: ResourceConflict[] = [];
    
    for (const resource of allocated) {
      const available = this.availableResources.get(resource.name.toLowerCase().replace(' ', '-'));
      
      if (available && resource.quantity > available.quantity) {
        conflicts.push({
          phase: phase.phase_number,
          resource: resource.name,
          required: resource.quantity,
          available: available.quantity,
          resolution: this.suggestResolution(resource, available)
        });
      }
    }
    
    return conflicts;
  }

  private suggestResolution(required: Resource, available: Resource): string {
    if (required.type === 'human') {
      if (required.quantity > available.quantity * 1.5) {
        return 'Consider extending timeline or hiring contractors';
      } else {
        return 'Optimize task allocation or implement overtime';
      }
    } else if (required.type === 'system') {
      return 'Provision additional cloud resources or virtualize environments';
    }
    
    return 'Review resource requirements and adjust plan';
  }

  private calculateTotalResources(phaseResources: Map<number, Resource[]>): Resource[] {
    const totals = new Map<string, Resource>();
    
    for (const resources of phaseResources.values()) {
      for (const resource of resources) {
        const key = `${resource.type}-${resource.name}`;
        
        if (totals.has(key)) {
          const existing = totals.get(key)!;
          existing.quantity = Math.max(existing.quantity, resource.quantity);
        } else {
          totals.set(key, { ...resource });
        }
      }
    }
    
    return Array.from(totals.values());
  }

  private calculateUtilization(phases: Phase[], allocations: Map<number, Resource[]>): Map<string, number> {
    const utilization = new Map<string, number>();
    
    for (const [phaseNum, resources] of allocations) {
      const phase = phases.find(p => p.phase_number === phaseNum);
      if (!phase) continue;
      
      for (const resource of resources) {
        const key = resource.name;
        const available = this.availableResources.get(resource.name.toLowerCase().replace(' ', '-'));
        
        if (available) {
          const usage = (resource.quantity / available.quantity) * 100;
          
          if (utilization.has(key)) {
            utilization.set(key, Math.max(utilization.get(key)!, usage));
          } else {
            utilization.set(key, usage);
          }
        }
      }
    }
    
    return utilization;
  }

  public optimizeAllocation(plan: ResourcePlan): ResourcePlan {
    // Optimize resource allocation to resolve conflicts
    const optimized = { ...plan };
    
    for (const conflict of plan.conflicts) {
      // Try to redistribute resources across phases
      const phase = conflict.phase;
      const resources = plan.phases.get(phase);
      
      if (resources) {
        // Find the conflicting resource
        const resourceIndex = resources.findIndex(r => r.name === conflict.resource);
        
        if (resourceIndex >= 0) {
          // Reduce to available quantity
          resources[resourceIndex].quantity = conflict.available;
          
          // Mark as needing optimization
          resources[resourceIndex].availability = 'scheduled' as const;
        }
      }
    }
    
    return optimized;
  }

  public calculateCost(resources: Resource[]): number {
    const hourlyRates = {
      'Developer': 150,
      'QA Engineer': 100,
      'Data Analyst': 120,
      'Development Server': 50,
      'Test Environment': 30
    };
    
    let totalCost = 0;
    
    for (const resource of resources) {
      const rate = hourlyRates[resource.name as keyof typeof hourlyRates] || 0;
      // Assume 40 hours per week per resource
      totalCost += rate * 40 * resource.quantity;
    }
    
    return totalCost;
  }

  public getResourceAvailability(resourceName: string): Resource | undefined {
    return this.availableResources.get(resourceName.toLowerCase().replace(' ', '-'));
  }

  public updateResourceAvailability(resourceName: string, quantity: number): void {
    const resource = this.availableResources.get(resourceName.toLowerCase().replace(' ', '-'));
    if (resource) {
      resource.quantity = quantity;
    }
  }
}