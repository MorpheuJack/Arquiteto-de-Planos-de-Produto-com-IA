export type PlanSection = 
  | 'userIdentification'
  | 'applicationObjective'
  | 'keyFeatures'
  | 'userJourney'
  | 'uiDesign'
  | 'technology'
  | 'scalabilitySecurity'
  | 'monetization'
  | 'successMetrics'
  | 'competitiveAdvantage'
  | 'actionItems';

export interface PlanStep {
  id: PlanSection;
  title: string;
  description: string;
}

export interface SectionData {
  userInput: string;
  generatedContent: string;
  isExample?: boolean;
  history?: string[];
}

export type ProductPlan = Record<PlanSection, SectionData>;

export type AISuggestions = Partial<Record<PlanSection, string[]>>;

export type LeanCanvasBlock =
  | 'problem'
  | 'solution'
  | 'keyMetrics'
  | 'uniqueValueProposition'
  | 'unfairAdvantage'
  | 'channels'
  | 'customerSegments'
  | 'costStructure'
  | 'revenueStreams';

export type LeanCanvasData = Record<LeanCanvasBlock, string>;