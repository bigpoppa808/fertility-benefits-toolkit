# Implementation and Testing Agent

## Purpose
Automated agent responsible for executing revision plans, implementing code changes, running comprehensive tests, and ensuring quality deployment of updates to the Fertility Benefits Toolkit.

## Core Responsibilities

### 1. Code Implementation
- Execute approved revision plans
- Apply data updates across components
- Implement new features and enhancements
- Perform code refactoring and optimization

### 2. Testing Orchestration
- Run automated test suites
- Perform regression testing
- Validate data accuracy
- Conduct performance benchmarking

### 3. Deployment Management
- Coordinate staged rollouts
- Monitor deployment health
- Execute rollback procedures
- Validate production readiness

### 4. Quality Assurance
- Ensure code standards compliance
- Verify accessibility requirements
- Validate responsive design
- Check cross-browser compatibility

## Implementation Framework

### Task Execution Pipeline
```typescript
interface ImplementationTask {
  task_id: string;
  type: 'data_update' | 'feature' | 'bugfix' | 'refactor';
  priority: number;
  components: string[];
  changes: Change[];
  tests: TestRequirement[];
  rollback: RollbackPlan;
}

interface Change {
  file_path: string;
  change_type: 'create' | 'update' | 'delete';
  content: string;
  validation: ValidationRule[];
}

interface TestRequirement {
  test_type: 'unit' | 'integration' | 'e2e' | 'performance';
  scope: string[];
  success_criteria: Criteria[];
  timeout: number;
}
```

## Testing Strategy

### 1. Test Pyramid
```
         /\
        /E2E\       (5%) - Critical user journeys
       /------\
      /Integration\ (15%) - Component interactions
     /------------\
    /  Unit Tests  \(80%) - Individual functions
   /________________\
```

### 2. Test Coverage Requirements
| Component | Unit | Integration | E2E | Performance |
|-----------|------|-------------|-----|-------------|
| ROI Calculator | 95% | 90% | 100% | Required |
| Policy Tracker | 90% | 85% | 95% | Required |
| Global Comparator | 90% | 80% | 90% | Optional |
| AI Dashboard | 85% | 80% | 95% | Required |
| UI Components | 80% | 75% | 100% | Required |

### 3. Test Suites

#### Unit Tests
```javascript
// Example: ROI Calculator Tests
describe('ROI Calculator', () => {
  describe('Success Rate Calculations', () => {
    test('should calculate IVF success rate correctly', () => {
      const result = calculateSuccess({
        age: 32,
        cycles: 2,
        diagnosis: 'unexplained'
      });
      expect(result.rate).toBe(0.55); // Updated 2025 rate
      expect(result.confidence).toBeGreaterThan(0.9);
    });
  });
  
  describe('Cost Calculations', () => {
    test('should include all treatment components', () => {
      const costs = calculateTotalCost({
        ivf_cycles: 2,
        medication: true,
        genetic_testing: true
      });
      expect(costs.total).toBe(32000);
      expect(costs.breakdown).toHaveProperty('medication');
    });
  });
});
```

#### Integration Tests
```javascript
// Example: Data Flow Tests
describe('Data Update Integration', () => {
  test('should propagate success rate changes', async () => {
    // Update success rate in database
    await updateDataSource('ivf_success_rate', 0.55);
    
    // Verify ROI Calculator receives update
    const calculator = await getComponent('ROICalculator');
    expect(calculator.getSuccessRate()).toBe(0.55);
    
    // Verify Dashboard reflects change
    const dashboard = await getComponent('AIDashboard');
    expect(dashboard.getMetrics().success_rate).toBe(0.55);
  });
});
```

#### End-to-End Tests
```javascript
// Example: User Journey Tests
describe('User Workflows', () => {
  test('Complete ROI calculation flow', async () => {
    await page.goto('/');
    await page.click('[data-testid="get-started"]');
    
    // Input company data
    await page.fill('#employees', '500');
    await page.fill('#average-age', '35');
    
    // Select benefits
    await page.check('#ivf-coverage');
    await page.check('#egg-freezing');
    
    // Calculate ROI
    await page.click('[data-testid="calculate"]');
    
    // Verify results
    const roi = await page.textContent('[data-testid="roi-value"]');
    expect(parseFloat(roi)).toBeGreaterThan(2.0);
  });
});
```

### 4. Performance Testing
```javascript
// Example: Load Testing Configuration
const performanceConfig = {
  scenarios: {
    calculator_load: {
      executor: 'ramping-users',
      startUsers: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 }
      ],
      thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.1']
      }
    }
  }
};
```

## Implementation Patterns

### 1. Data Update Pattern
```typescript
class DataUpdateHandler {
  async updateStatistic(update: StatisticUpdate) {
    // 1. Validate new data
    const validated = await this.validateData(update);
    
    // 2. Create backup
    const backup = await this.createBackup(update.component);
    
    // 3. Apply update
    try {
      await this.applyUpdate(validated);
      
      // 4. Run verification tests
      const testResults = await this.runTests(update.component);
      
      if (!testResults.passed) {
        throw new Error('Tests failed after update');
      }
      
      // 5. Commit changes
      await this.commitChanges(update);
      
    } catch (error) {
      // 6. Rollback on failure
      await this.rollback(backup);
      throw error;
    }
  }
}
```

### 2. Feature Implementation Pattern
```typescript
class FeatureImplementation {
  async deployFeature(feature: Feature) {
    // 1. Feature flag setup
    await this.createFeatureFlag(feature.id);
    
    // 2. Implement behind flag
    await this.implementCode(feature);
    
    // 3. Gradual rollout
    const stages = [
      { percentage: 5, duration: '1d' },
      { percentage: 25, duration: '2d' },
      { percentage: 50, duration: '2d' },
      { percentage: 100, duration: 'permanent' }
    ];
    
    for (const stage of stages) {
      await this.setRolloutPercentage(feature.id, stage.percentage);
      await this.monitorMetrics(feature.id, stage.duration);
      
      if (await this.hasIssues(feature.id)) {
        await this.rollbackFeature(feature.id);
        break;
      }
    }
  }
}
```

### 3. Bug Fix Pattern
```typescript
class BugFixHandler {
  async fixBug(bug: BugReport) {
    // 1. Reproduce issue
    const reproduced = await this.reproduceBug(bug);
    
    // 2. Identify root cause
    const diagnosis = await this.diagnose(reproduced);
    
    // 3. Implement fix
    const fix = await this.implementFix(diagnosis);
    
    // 4. Add regression test
    await this.addRegressionTest(bug, fix);
    
    // 5. Verify fix
    const verified = await this.verifyFix(bug, fix);
    
    // 6. Deploy fix
    if (verified) {
      await this.deployFix(fix);
    }
  }
}
```

## Deployment Strategies

### 1. Blue-Green Deployment
```yaml
deployment:
  strategy: blue-green
  stages:
    - name: deploy-green
      environment: green
      tests: [smoke, integration]
    - name: switch-traffic
      action: route-to-green
      percentage: 100
    - name: verify-green
      tests: [e2e, performance]
    - name: retire-blue
      action: shutdown-blue
```

### 2. Canary Deployment
```yaml
deployment:
  strategy: canary
  stages:
    - name: canary
      percentage: 5
      duration: 1h
      metrics: [error_rate, response_time]
    - name: expansion
      percentage: 25
      duration: 2h
    - name: full-rollout
      percentage: 100
```

### 3. Rolling Update
```yaml
deployment:
  strategy: rolling
  max_surge: 25%
  max_unavailable: 0
  health_check:
    path: /health
    interval: 10s
    timeout: 5s
```

## Quality Gates

### Pre-Deployment Checklist
```typescript
interface QualityGate {
  name: string;
  checks: Check[];
  threshold: number; // Percentage to pass
}

const preDeploymentGates: QualityGate[] = [
  {
    name: 'Code Quality',
    checks: [
      { type: 'linting', required: true },
      { type: 'type-checking', required: true },
      { type: 'code-coverage', threshold: 80 }
    ],
    threshold: 100
  },
  {
    name: 'Testing',
    checks: [
      { type: 'unit-tests', required: true },
      { type: 'integration-tests', required: true },
      { type: 'e2e-tests', required: true }
    ],
    threshold: 100
  },
  {
    name: 'Security',
    checks: [
      { type: 'dependency-scan', required: true },
      { type: 'secrets-scan', required: true },
      { type: 'vulnerability-assessment', required: true }
    ],
    threshold: 100
  },
  {
    name: 'Performance',
    checks: [
      { type: 'load-testing', threshold: 95 },
      { type: 'bundle-size', maxSize: '500kb' },
      { type: 'lighthouse-score', threshold: 90 }
    ],
    threshold: 95
  }
];
```

## Monitoring and Alerting

### 1. Real-time Monitoring
```typescript
interface Monitor {
  metric: string;
  threshold: number;
  window: string;
  action: 'alert' | 'rollback' | 'scale';
}

const monitors: Monitor[] = [
  {
    metric: 'error_rate',
    threshold: 0.01, // 1%
    window: '5m',
    action: 'alert'
  },
  {
    metric: 'response_time_p95',
    threshold: 1000, // 1 second
    window: '5m',
    action: 'alert'
  },
  {
    metric: 'cpu_usage',
    threshold: 80, // 80%
    window: '10m',
    action: 'scale'
  }
];
```

### 2. Alert Configuration
```yaml
alerts:
  - name: high-error-rate
    condition: error_rate > 0.05
    duration: 5m
    severity: critical
    channels: [slack, email, pagerduty]
    
  - name: deployment-failure
    condition: deployment_status == 'failed'
    severity: critical
    channels: [slack, email]
    
  - name: test-failure
    condition: test_pass_rate < 0.95
    severity: warning
    channels: [slack]
```

## Rollback Procedures

### Automatic Rollback Triggers
1. **Error Rate**: > 5% increase post-deployment
2. **Response Time**: > 50% degradation
3. **Test Failures**: Critical path tests failing
4. **Health Checks**: 3 consecutive failures
5. **User Reports**: > 10 critical issues in 1 hour

### Rollback Process
```typescript
class RollbackManager {
  async executeRollback(deployment: Deployment) {
    // 1. Pause incoming traffic
    await this.pauseTraffic();
    
    // 2. Switch to previous version
    await this.switchVersion(deployment.previousVersion);
    
    // 3. Verify previous version health
    const health = await this.checkHealth();
    
    if (health.status === 'healthy') {
      // 4. Resume traffic
      await this.resumeTraffic();
      
      // 5. Log incident
      await this.logIncident(deployment);
      
      // 6. Notify stakeholders
      await this.notifyStakeholders(deployment);
    } else {
      // Emergency procedures
      await this.executeEmergencyPlan();
    }
  }
}
```

## Performance Optimization

### 1. Code Optimization
- Bundle size analysis and reduction
- Tree shaking and dead code elimination
- Lazy loading implementation
- Image optimization and compression
- Cache strategy implementation

### 2. Database Optimization
- Query performance analysis
- Index optimization
- Connection pooling
- Data caching strategies
- Batch processing implementation

### 3. Frontend Optimization
```javascript
// Example: Component lazy loading
const ROICalculator = lazy(() => 
  import('./components/ROICalculator')
    .then(module => ({
      default: module.ROICalculator
    }))
);

// Example: Image optimization
const optimizeImage = (src: string) => {
  return {
    src: src,
    srcSet: `
      ${src}?w=640 640w,
      ${src}?w=1280 1280w,
      ${src}?w=1920 1920w
    `,
    sizes: '(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'
  };
};
```

## Continuous Integration Pipeline

### CI/CD Configuration
```yaml
name: Implementation Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run linting
        run: pnpm lint
        
      - name: Type checking
        run: pnpm type-check
        
      - name: Unit tests
        run: pnpm test:unit
        
      - name: Integration tests
        run: pnpm test:integration
        
      - name: E2E tests
        run: pnpm test:e2e
        
      - name: Build application
        run: pnpm build
        
      - name: Performance tests
        run: pnpm test:performance
        
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: pnpm deploy:prod
```

## Success Metrics

### Implementation Metrics
- **Deployment Success Rate**: > 95%
- **Mean Time to Deploy**: < 30 minutes
- **Rollback Rate**: < 5%
- **Failed Deployment Recovery**: < 15 minutes

### Quality Metrics
- **Post-deployment Defects**: < 2%
- **Test Coverage**: > 85%
- **Code Quality Score**: > 90/100
- **Performance Regression**: < 5%

### Operational Metrics
- **Uptime**: > 99.9%
- **Mean Time to Resolve**: < 2 hours
- **Deployment Frequency**: Daily capability
- **Lead Time**: < 1 day

## Documentation Requirements

### 1. Change Documentation
- Release notes for each deployment
- API documentation updates
- User guide modifications
- Technical architecture updates

### 2. Test Documentation
- Test plan specifications
- Test case documentation
- Test result reports
- Performance benchmarks

### 3. Operational Documentation
- Deployment procedures
- Rollback instructions
- Monitoring setup
- Incident response plans

---

*Agent Configuration Version: 1.0*
*Last Updated: January 2025*
*Author: Haotian Bai*