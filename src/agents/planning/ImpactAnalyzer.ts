import { Finding } from '../types';

export interface ImpactScore {
  user_impact: number;
  data_accuracy: number;
  compliance: number;
  competitive: number;
  total: number;
}

export class ImpactAnalyzer {
  private weights = {
    user_impact: 0.4,
    data_accuracy: 0.3,
    compliance: 0.2,
    competitive: 0.1
  };

  analyze(findings: Finding[]): ImpactScore {
    const score: ImpactScore = {
      user_impact: 0,
      data_accuracy: 0,
      compliance: 0,
      competitive: 0,
      total: 0
    };
    
    for (const finding of findings) {
      score.user_impact += this.assessUserImpact(finding);
      score.data_accuracy += this.assessDataAccuracy(finding);
      score.compliance += this.assessCompliance(finding);
      score.competitive += this.assessCompetitive(finding);
    }
    
    // Normalize scores
    const count = findings.length;
    if (count > 0) {
      score.user_impact /= count;
      score.data_accuracy /= count;
      score.compliance /= count;
      score.competitive /= count;
    }
    
    // Calculate weighted total
    score.total = 
      score.user_impact * this.weights.user_impact +
      score.data_accuracy * this.weights.data_accuracy +
      score.compliance * this.weights.compliance +
      score.competitive * this.weights.competitive;
    
    return score;
  }

  private assessUserImpact(finding: Finding): number {
    let impact = 0;
    
    // Check if affects core functionality
    if (finding.impact.includes('ROI') || finding.impact.includes('calculator')) {
      impact += 8;
    }
    
    // Check if affects user experience
    if (finding.impact.includes('user') || finding.impact.includes('experience')) {
      impact += 6;
    }
    
    // Priority-based impact
    switch (finding.priority) {
      case 'critical': impact += 10; break;
      case 'high': impact += 7; break;
      case 'medium': impact += 5; break;
      case 'low': impact += 3; break;
    }
    
    return Math.min(impact / 2, 10); // Normalize to 0-10
  }

  private assessDataAccuracy(finding: Finding): number {
    if (finding.category !== 'scientific') {
      return 0;
    }
    
    let accuracy = finding.confidence_score * 10;
    
    // Check if affects critical calculations
    if (finding.data && (
      'success_rate' in finding.data ||
      'cost' in finding.data ||
      'roi' in finding.data
    )) {
      accuracy = Math.min(accuracy + 3, 10);
    }
    
    return accuracy;
  }

  private assessCompliance(finding: Finding): number {
    if (finding.category !== 'legislative') {
      return 0;
    }
    
    let compliance = 0;
    
    // Check for mandate or requirement
    if (finding.impact.includes('mandate') || 
        finding.impact.includes('require') ||
        finding.impact.includes('compliance')) {
      compliance = 10;
    } else {
      compliance = 5;
    }
    
    // Adjust based on jurisdiction
    if (finding.data?.jurisdiction === 'federal') {
      compliance = Math.min(compliance + 2, 10);
    }
    
    return compliance;
  }

  private assessCompetitive(finding: Finding): number {
    if (finding.category !== 'market') {
      return 0;
    }
    
    let competitive = 5; // Base score for market findings
    
    // Check for competitor features
    if (finding.impact.includes('feature') || finding.impact.includes('parity')) {
      competitive += 3;
    }
    
    // Check for market opportunity
    if (finding.impact.includes('opportunity') || finding.impact.includes('advantage')) {
      competitive += 2;
    }
    
    return Math.min(competitive, 10);
  }

  public calculateUrgency(finding: Finding): number {
    let urgency = 0;
    
    // Priority-based urgency
    switch (finding.priority) {
      case 'critical': urgency = 10; break;
      case 'high': urgency = 7; break;
      case 'medium': urgency = 4; break;
      case 'low': urgency = 2; break;
    }
    
    // Check for deadline
    if (finding.data?.effective_date || finding.data?.deadline) {
      const deadline = new Date(finding.data.effective_date || finding.data.deadline);
      const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil < 7) urgency = 10;
      else if (daysUntil < 30) urgency = Math.max(urgency, 8);
      else if (daysUntil < 90) urgency = Math.max(urgency, 5);
    }
    
    return urgency;
  }
}