export interface Advisor {
  id: string;
  name: string;
  avatar: string;
  title: string;
  traits: string[];
  voiceStyle: string;
  backstory: string;
  influence: number;
  color: string;
  createdAt: string;
}

export interface CouncilSession {
  id: string;
  date: string;
  question: string;
  participants: string[];
  responses: Array<{
    advisorId: string;
    responseText: string;
    timestamp: string;
  }>;
  summary?: string;
}
