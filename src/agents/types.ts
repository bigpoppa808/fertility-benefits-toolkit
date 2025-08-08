// Agent System Type Definitions

export type AgentType = 'research' | 'planning' | 'implementation';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type MessageType = 'finding' | 'plan' | 'status' | 'alert' | 'request';

export interface AgentMessage {
  id: string;
  sender: AgentType;
  recipient: AgentType | 'broadcast';
  timestamp: Date;
  message_type: MessageType;
  priority: Priority;
  payload: any;
  correlation_id: string;
  requires_response: boolean;
}

export interface Finding {
  id: string;
  source: string;
  category: 'scientific' | 'legislative' | 'market' | 'technical';
  title: string;
  description: string;
  key_points: string[];
  impact: string;
  priority: Priority;
  confidence_score: number;
  data?: any;
  recommended_actions: string[];
  validation_required: boolean;
  created_at: Date;
}

export interface RevisionPlan {
  plan_id: string;
  created_date: Date;
  status: 'draft' | 'approved' | 'in_progress' | 'completed';
  findings: Finding[];
  phases: Phase[];
  total_effort: number;
  risk_assessment: RiskAssessment;
  success_metrics: Metric[];
  deadline?: Date;
}

export interface Phase {
  phase_number: number;
  title: string;
  objectives: string[];
  tasks: Task[];
  dependencies: string[];
  duration: number; // days
  resources_required: Resource[];
}

export interface Task {
  id: string;
  type: 'data_update' | 'feature' | 'bugfix' | 'refactor';
  title: string;
  description: string;
  component: string;
  priority: number;
  estimated_hours: number;
  actual_hours?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assigned_to?: string;
  changes: Change[];
  tests: TestRequirement[];
  rollback?: RollbackPlan;
}

export interface Change {
  file_path: string;
  change_type: 'create' | 'update' | 'delete';
  content: string;
  validation: ValidationRule[];
}

export interface ValidationRule {
  type: string;
  expected: any;
  actual?: any;
  passed?: boolean;
}

export interface TestRequirement {
  test_type: 'unit' | 'integration' | 'e2e' | 'performance';
  scope: string[];
  success_criteria: Criteria[];
  timeout: number;
  status?: 'pending' | 'running' | 'passed' | 'failed';
}

export interface Criteria {
  metric: string;
  operator: '>' | '<' | '=' | '>=' | '<=';
  value: number;
}

export interface RollbackPlan {
  trigger_conditions: string[];
  steps: string[];
  verification: string[];
  time_limit: number; // minutes
}

export interface RiskAssessment {
  risks: Risk[];
  overall_risk_level: 'low' | 'medium' | 'high';
  mitigation_strategies: string[];
}

export interface Risk {
  type: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
}

export interface Metric {
  name: string;
  target: number;
  unit: string;
  measurement_method: string;
}

export interface Resource {
  type: 'human' | 'system' | 'external';
  name: string;
  quantity: number;
  availability: 'available' | 'scheduled' | 'unavailable';
}

export interface ExecutionResult {
  execution_id: string;
  plan_id: string;
  status: 'success' | 'partial' | 'failed';
  completed_tasks: string[];
  failed_tasks: string[];
  metrics: Record<string, number>;
  logs: LogEntry[];
  duration: number;
}

export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

export interface AgentConfig {
  agent_type: AgentType;
  enabled: boolean;
  update_frequency: string;
  data_sources: DataSource[];
  notification_channels: string[];
  thresholds: Record<string, number>;
}

export interface DataSource {
  name: string;
  type: 'api' | 'web' | 'database' | 'file';
  url?: string;
  credentials?: {
    api_key?: string;
    username?: string;
    password?: string;
  };
  update_interval: number; // minutes
  last_updated?: Date;
}

export interface AgentMetrics {
  agent_id: string;
  uptime: number;
  tasks_completed: number;
  tasks_failed: number;
  average_task_time: number;
  error_rate: number;
  last_activity: Date;
  health_status: 'healthy' | 'degraded' | 'critical';
}

export interface Alert {
  id: string;
  agent_id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
}