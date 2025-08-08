import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Database,
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { agentSystem } from '@/agents/AgentSystem';

interface SystemMetrics {
  uptime: number;
  agents: Array<{
    agent_id: string;
    health_status: 'healthy' | 'degraded' | 'critical';
    tasks_completed: number;
    tasks_failed: number;
    error_rate: number;
  }>;
  total_findings: number;
  active_plans: number;
  message_count: number;
  overall_health: 'healthy' | 'degraded' | 'critical';
}

export function AgentMonitor() {
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [eventHistory, setEventHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check initial system status
    setIsRunning(agentSystem.isSystemRunning());
    
    // Set up polling for metrics
    const interval = setInterval(() => {
      if (agentSystem.isSystemRunning()) {
        updateMetrics();
      }
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const updateMetrics = () => {
    const systemMetrics = agentSystem.getSystemMetrics();
    setMetrics(systemMetrics);
    setLastUpdate(new Date());
    
    // Get recent events
    const recentEvents = agentSystem.getEventHistory({
      since: new Date(Date.now() - 60000) // Last minute
    });
    setEventHistory(recentEvents.slice(-10)); // Keep last 10 events
  };

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await agentSystem.start();
      setIsRunning(true);
      updateMetrics();
    } catch (error) {
      console.error('Failed to start agent system:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    setIsLoading(true);
    try {
      await agentSystem.stop();
      setIsRunning(false);
    } catch (error) {
      console.error('Failed to stop agent system:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualScan = async () => {
    await agentSystem.triggerManualScan();
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Agent System Control
            </div>
            <div className="flex items-center gap-2">
              {isRunning ? (
                <Button 
                  variant="destructive" 
                  onClick={handleStop}
                  disabled={isLoading}
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Stop System
                </Button>
              ) : (
                <Button 
                  onClick={handleStart}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start System
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleManualScan}
                disabled={!isRunning || isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Manual Scan
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Monitor and control the three-agent research and implementation system
          </CardDescription>
        </CardHeader>
      </Card>

      {/* System Status */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getHealthIcon(metrics.overall_health)}
                    <p className="text-2xl font-bold capitalize">{metrics.overall_health}</p>
                  </div>
                </div>
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold">{formatUptime(metrics.uptime)}</p>
                </div>
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Plans</p>
                  <p className="text-2xl font-bold">{metrics.active_plans}</p>
                </div>
                <Database className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Findings</p>
                  <p className="text-2xl font-bold">{metrics.total_findings}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agent Details */}
      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="events">Event History</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          {metrics?.agents.map((agent) => (
            <Card key={agent.agent_id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {agent.agent_id}
                  </div>
                  {getHealthIcon(agent.health_status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tasks Completed</p>
                    <p className="text-xl font-semibold">{agent.tasks_completed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tasks Failed</p>
                    <p className="text-xl font-semibold">{agent.tasks_failed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Error Rate</p>
                    <p className="text-xl font-semibold">
                      {(agent.error_rate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-xl font-semibold capitalize">{agent.health_status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="events" className="space-y-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                Last updated: {lastUpdate.toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {eventHistory.length > 0 ? (
                  eventHistory.map((event, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-gray-50 rounded-lg text-sm font-mono"
                    >
                      <div className="flex justify-between">
                        <span className="font-semibold">{event.message_type}</span>
                        <span className="text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-gray-600 mt-1">
                        {event.sender} → {event.recipient}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No recent events</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Message Count</span>
                  <span className="font-semibold">{metrics?.message_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Findings</span>
                  <span className="font-semibold">{metrics?.total_findings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Plans</span>
                  <span className="font-semibold">{metrics?.active_plans || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">System Uptime</span>
                  <span className="font-semibold">
                    {metrics ? formatUptime(metrics.uptime) : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}