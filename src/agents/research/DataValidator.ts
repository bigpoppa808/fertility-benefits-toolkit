import { Finding } from '../types';

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  suggestedValue?: any;
  sources: string[];
  issues?: string[];
}

export class DataValidator {
  private knownRanges: Record<string, { min: number; max: number }> = {
    ivf_success_rate: { min: 0.05, max: 0.65 },
    ivf_cost: { min: 10000, max: 50000 },
    egg_freezing_cost: { min: 5000, max: 20000 },
    adoption_rate: { min: 0.1, max: 0.6 },
    employee_satisfaction: { min: 0.5, max: 1.0 }
  };

  private trustedSources = [
    'CDC',
    'ASRM',
    'SART',
    'Kaiser Family Foundation',
    'Mercer',
    'PubMed',
    'Congress.gov'
  ];

  validateFinding(finding: Finding): number {
    let confidence = finding.confidence_score;
    
    // Check source credibility
    const sourceCredibility = this.assessSourceCredibility(finding.source);
    confidence *= sourceCredibility;
    
    // Validate data ranges
    if (finding.data) {
      const dataValidation = this.validateDataRanges(finding.data);
      confidence *= dataValidation;
    }
    
    // Cross-reference with known data
    const crossReference = this.crossReferenceData(finding);
    confidence *= crossReference;
    
    // Check data freshness
    const freshness = this.assessDataFreshness(finding.created_at);
    confidence *= freshness;
    
    return Math.min(confidence, 1.0);
  }

  async validateDataPoint(dataPoint: string, value: any): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      confidence: 1.0,
      sources: [],
      issues: []
    };

    // Check if value is within known ranges
    if (this.knownRanges[dataPoint]) {
      const range = this.knownRanges[dataPoint];
      if (typeof value === 'number') {
        if (value < range.min || value > range.max) {
          result.isValid = false;
          result.issues?.push(`Value ${value} is outside expected range [${range.min}, ${range.max}]`);
          result.suggestedValue = Math.max(range.min, Math.min(value, range.max));
          result.confidence = 0.5;
        }
      }
    }

    // Validate against multiple sources
    const sourcesData = await this.fetchFromMultipleSources(dataPoint);
    if (sourcesData.length > 0) {
      const average = this.calculateAverage(sourcesData.map(s => s.value));
      const variance = this.calculateVariance(sourcesData.map(s => s.value), average);
      
      result.sources = sourcesData.map(s => s.source);
      
      if (variance > 0.1) {
        result.confidence *= 0.8;
        result.issues?.push('High variance between sources');
      }
      
      if (Math.abs(value - average) / average > 0.2) {
        result.confidence *= 0.7;
        result.issues?.push(`Value differs significantly from average: ${average}`);
        result.suggestedValue = average;
      }
    }

    return result;
  }

  private assessSourceCredibility(source: string): number {
    // Check if source is in trusted list
    for (const trusted of this.trustedSources) {
      if (source.toLowerCase().includes(trusted.toLowerCase())) {
        return 1.0;
      }
    }
    
    // Academic sources
    if (source.includes('.edu') || source.includes('journal')) {
      return 0.9;
    }
    
    // Government sources
    if (source.includes('.gov')) {
      return 0.95;
    }
    
    // Industry reports
    if (source.includes('report') || source.includes('survey')) {
      return 0.8;
    }
    
    // Unknown sources
    return 0.6;
  }

  private validateDataRanges(data: any): number {
    let validCount = 0;
    let totalCount = 0;
    
    for (const [key, value] of Object.entries(data)) {
      if (this.knownRanges[key] && typeof value === 'number') {
        totalCount++;
        const range = this.knownRanges[key];
        if (value >= range.min && value <= range.max) {
          validCount++;
        }
      }
    }
    
    if (totalCount === 0) return 1.0;
    return validCount / totalCount;
  }

  private crossReferenceData(finding: Finding): number {
    // Simulate cross-referencing with existing data
    // In a real implementation, this would check against a database
    
    // Check for conflicting information
    if (finding.category === 'scientific') {
      // Scientific data should be consistent with recent studies
      return 0.95;
    }
    
    if (finding.category === 'legislative') {
      // Legislative data is usually definitive
      return 1.0;
    }
    
    if (finding.category === 'market') {
      // Market data can vary more
      return 0.85;
    }
    
    return 0.9;
  }

  private assessDataFreshness(date: Date): number {
    const now = new Date();
    const ageInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    
    if (ageInDays < 30) return 1.0;
    if (ageInDays < 90) return 0.95;
    if (ageInDays < 180) return 0.85;
    if (ageInDays < 365) return 0.7;
    return 0.5;
  }

  private async fetchFromMultipleSources(dataPoint: string): Promise<Array<{source: string, value: any}>> {
    // Simulate fetching from multiple sources
    // In a real implementation, this would make actual API calls
    
    const mockData: Record<string, Array<{source: string, value: any}>> = {
      ivf_success_rate: [
        { source: 'CDC 2025', value: 0.55 },
        { source: 'SART 2025', value: 0.54 },
        { source: 'ASRM Study', value: 0.56 }
      ],
      ivf_cost: [
        { source: 'FertilityIQ', value: 32000 },
        { source: 'ASRM Survey', value: 30000 },
        { source: 'Carrot Report', value: 35000 }
      ]
    };
    
    return mockData[dataPoint] || [];
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return this.calculateAverage(squaredDiffs);
  }

  public validateStatistic(name: string, value: number, source: string): boolean {
    // Quick validation for statistics
    if (!this.knownRanges[name]) {
      return true; // If we don't know the range, assume it's valid
    }
    
    const range = this.knownRanges[name];
    return value >= range.min && value <= range.max;
  }

  public suggestCorrection(name: string, value: number): number {
    if (!this.knownRanges[name]) {
      return value;
    }
    
    const range = this.knownRanges[name];
    return Math.max(range.min, Math.min(value, range.max));
  }
}