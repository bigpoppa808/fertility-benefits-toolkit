import { Finding } from '../types';

export interface Dependency {
  source: string;
  target: string;
  type: 'data' | 'functional' | 'temporal';
  strength: 'strong' | 'weak';
}

export class DependencyManager {
  private componentDependencies: Map<string, Set<string>> = new Map();
  
  constructor() {
    // Define known component dependencies
    this.initializeComponentDependencies();
  }

  private initializeComponentDependencies(): void {
    // ROI Calculator dependencies
    this.componentDependencies.set('ROI Calculator', new Set([
      'Data Sources',
      'Calculation Engine',
      'Success Rates',
      'Cost Data'
    ]));
    
    // Policy Tracker dependencies
    this.componentDependencies.set('Policy Tracker', new Set([
      'Legislative Database',
      'Compliance Engine',
      'Notification System'
    ]));
    
    // Global Comparator dependencies
    this.componentDependencies.set('Global Comparator', new Set([
      'International Data',
      'Market Analysis',
      'Currency Conversion'
    ]));
    
    // AI Dashboard dependencies
    this.componentDependencies.set('AI Dashboard', new Set([
      'ROI Calculator',
      'Policy Tracker',
      'Analytics Engine',
      'Visualization'
    ]));
  }

  analyzeDependencies(findings: Finding[]): Map<string, string[]> {
    const dependencies = new Map<string, string[]>();
    const components = this.extractComponents(findings);
    
    // Analyze dependencies between components
    for (const component of components) {
      const deps = this.getComponentDependencies(component);
      const affectedByOthers = this.findAffectedComponents(component, components);
      
      if (deps.length > 0 || affectedByOthers.length > 0) {
        dependencies.set(component, [...deps, ...affectedByOthers]);
      }
    }
    
    // Analyze temporal dependencies
    const temporalDeps = this.analyzeTemporalDependencies(findings);
    for (const [key, value] of temporalDeps) {
      if (dependencies.has(key)) {
        dependencies.get(key)!.push(...value);
      } else {
        dependencies.set(key, value);
      }
    }
    
    return dependencies;
  }

  private extractComponents(findings: Finding[]): Set<string> {
    const components = new Set<string>();
    
    for (const finding of findings) {
      // Extract from recommended actions
      for (const action of finding.recommended_actions) {
        const component = this.extractComponentFromAction(action);
        if (component) {
          components.add(component);
        }
      }
      
      // Extract from impact
      const impactComponent = this.extractComponentFromText(finding.impact);
      if (impactComponent) {
        components.add(impactComponent);
      }
    }
    
    return components;
  }

  private extractComponentFromAction(action: string): string | null {
    const components = [
      'ROI Calculator',
      'Policy Tracker',
      'Global Comparator',
      'AI Dashboard',
      'Database',
      'API'
    ];
    
    for (const comp of components) {
      if (action.toLowerCase().includes(comp.toLowerCase())) {
        return comp;
      }
    }
    
    return null;
  }

  private extractComponentFromText(text: string): string | null {
    const componentKeywords = {
      'ROI Calculator': ['roi', 'calculator', 'calculation'],
      'Policy Tracker': ['policy', 'legislation', 'compliance'],
      'Global Comparator': ['global', 'international', 'comparison'],
      'AI Dashboard': ['dashboard', 'analytics', 'insights']
    };
    
    for (const [component, keywords] of Object.entries(componentKeywords)) {
      for (const keyword of keywords) {
        if (text.toLowerCase().includes(keyword)) {
          return component;
        }
      }
    }
    
    return null;
  }

  private getComponentDependencies(component: string): string[] {
    const deps = this.componentDependencies.get(component);
    return deps ? Array.from(deps) : [];
  }

  private findAffectedComponents(
    component: string, 
    allComponents: Set<string>
  ): string[] {
    const affected: string[] = [];
    
    for (const other of allComponents) {
      if (other === component) continue;
      
      const otherDeps = this.componentDependencies.get(other);
      if (otherDeps && otherDeps.has(component)) {
        affected.push(other);
      }
    }
    
    return affected;
  }

  private analyzeTemporalDependencies(findings: Finding[]): Map<string, string[]> {
    const temporal = new Map<string, string[]>();
    
    // Sort findings by urgency/deadline
    const sortedFindings = findings.sort((a, b) => {
      const aUrgency = this.calculateUrgency(a);
      const bUrgency = this.calculateUrgency(b);
      return bUrgency - aUrgency;
    });
    
    // Create temporal dependencies based on urgency
    for (let i = 0; i < sortedFindings.length - 1; i++) {
      const current = sortedFindings[i];
      const next = sortedFindings[i + 1];
      
      if (this.calculateUrgency(current) > this.calculateUrgency(next)) {
        const currentId = `finding-${current.id}`;
        const nextId = `finding-${next.id}`;
        
        if (!temporal.has(nextId)) {
          temporal.set(nextId, []);
        }
        temporal.get(nextId)!.push(currentId);
      }
    }
    
    return temporal;
  }

  private calculateUrgency(finding: Finding): number {
    let urgency = 0;
    
    switch (finding.priority) {
      case 'critical': urgency = 10; break;
      case 'high': urgency = 7; break;
      case 'medium': urgency = 4; break;
      case 'low': urgency = 1; break;
    }
    
    // Check for deadline
    if (finding.data?.effective_date) {
      const deadline = new Date(finding.data.effective_date);
      const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil < 30) {
        urgency += 5;
      } else if (daysUntil < 90) {
        urgency += 2;
      }
    }
    
    return urgency;
  }

  public createDependencyGraph(dependencies: Map<string, string[]>): {
    nodes: Array<{ id: string; label: string }>;
    edges: Array<{ source: string; target: string }>;
  } {
    const nodes: Array<{ id: string; label: string }> = [];
    const edges: Array<{ source: string; target: string }> = [];
    const nodeSet = new Set<string>();
    
    // Add all nodes
    for (const [key, deps] of dependencies) {
      if (!nodeSet.has(key)) {
        nodes.push({ id: key, label: key });
        nodeSet.add(key);
      }
      
      for (const dep of deps) {
        if (!nodeSet.has(dep)) {
          nodes.push({ id: dep, label: dep });
          nodeSet.add(dep);
        }
        
        edges.push({ source: dep, target: key });
      }
    }
    
    return { nodes, edges };
  }

  public detectCycles(dependencies: Map<string, string[]>): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const dfs = (node: string, path: string[]): void => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);
      
      const deps = dependencies.get(node) || [];
      for (const dep of deps) {
        if (!visited.has(dep)) {
          dfs(dep, [...path]);
        } else if (recursionStack.has(dep)) {
          // Cycle detected
          const cycleStart = path.indexOf(dep);
          cycles.push(path.slice(cycleStart));
        }
      }
      
      recursionStack.delete(node);
    };
    
    for (const node of dependencies.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }
    
    return cycles;
  }
}