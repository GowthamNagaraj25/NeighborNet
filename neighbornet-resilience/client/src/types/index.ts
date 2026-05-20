export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'resident' | 'organizer' | 'admin';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  neighborhood?: string;
  addressText?: string;
  location?: { type: string; coordinates: [number, number] };
  skills?: string[];
  availability?: string;
  badges?: string[];
  trustScore?: number;
  phone?: string;
  bloodGroup?: string;
  willingToDonate?: boolean;
  lastDonationDate?: string;
  emergencyContact?: string;
  createdAt?: string;
  verificationSubmission?: {
    addressProofType?: string;
    neighborhoodCode?: string;
    localReferenceName?: string;
    submittedAt?: string;
  };
}

export interface Post {
  _id: string;
  author: User | string;
  type: 'request' | 'offer';
  title: string;
  category: PostCategory;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'matched' | 'in-progress' | 'completed' | 'cancelled';
  vicinityRadiusKm?: number;
  location?: { type: string; coordinates: [number, number] };
  tags?: string[];
  neededByDate?: string;
  matchedUsers?: User[];
  completionNote?: string;
  amountNeeded?: number;
  repaymentDate?: string;
  createdAt?: string;
  updatedAt?: string;
  distanceKm?: number;
}

export type PostCategory =
  | 'groceries' | 'medical' | 'transport' | 'tools' | 'repairs'
  | 'childcare' | 'elderly-care' | 'education' | 'blood' | 'emergency'
  | 'money-lending' | 'logistics' | 'other';

export interface MessageThread {
  _id: string;
  participants: User[];
  post?: Post;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt?: string;
}

export interface Message {
  _id: string;
  thread: string;
  sender: User;
  text: string;
  readBy?: string[];
  createdAt?: string;
}

export interface Initiative {
  _id: string;
  title: string;
  description: string;
  organizer: User;
  targetCategory?: string;
  location?: { type: string; coordinates: [number, number] };
  radiusKm?: number;
  actionPlan?: string;
  status: 'planned' | 'active' | 'completed';
  requiredVolunteers?: number;
  requiredResources?: string[];
  createdAt?: string;
}

export interface TrendInsight {
  _id?: string;
  title: string;
  summary: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidenceCount: number;
  recommendedAction: string;
  affectedArea?: string;
  detectedFromPosts?: string[];
}

export interface AIMatch {
  type: 'post' | 'user';
  item: Post | User;
  score: number;
  distanceKm: number;
  reason: string;
  suggestedAction: string;
}

export interface LogisticsRoute {
  volunteer: string;
  volunteerId: string;
  volunteerSkills: string[];
  assignedTo: string;
  requestId: string;
  category: string;
  priority: string;
  distanceKm: number;
  score: number;
  reason: string;
  suggestedOrder: number;
}

export interface LogisticsPlan {
  summary: string;
  totalRequests: number;
  assignedCount: number;
  unassignedCount: number;
  routes: LogisticsRoute[];
  gaps: string[];
  recommendations: string[];
  generatedAt: string;
}

export interface CommunityPulse {
  totalRequests: number;
  totalOffers: number;
  urgentNeeds: number;
  completedHelps: number;
  totalUsers: number;
  verifiedUsers: number;
  topCategory: { name: string; count: number } | null;
  categoryBreakdown: Record<string, number>;
  topNeighborhoods: { _id: string; count: number }[];
  weeklyActivity: number;
}

export interface ActionPlan {
  title: string;
  objective: string;
  targetResidents: string;
  requiredVolunteers: number;
  requiredResources: string[];
  executionSteps: string[];
  suggestedMessage: string;
  successMetrics: string[];
  estimatedDuration: string;
  priority: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { field: string; message: string }[];
  total?: number;
  page?: number;
  pages?: number;
}
