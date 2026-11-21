export interface Agent {
  _id: string;
  userId: string;
  name: string;
  instructions: string;
  knowledgeBase?: string | null;
  tools: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgentFormData {
  name: string;
  instructions: string;
  knowledgeBase: string;
  tools: string[];
  isActive: boolean;
}

export interface PaginationInfo {
  totalAgents: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AgentCounts {
  total: number;
  active: number;
  inactive: number;
}


