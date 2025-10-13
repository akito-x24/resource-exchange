export type User = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type Resource = {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  description: string;
  dailyRate: number;
  imageUrl: string;
  status: 'active' | 'paused';
};

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'canceled' | 'completed';

export type Request = {
  id: string;
  resourceId: string;
  borrowerId: string;
  lenderId: string;
  note?: string;
  status: RequestStatus;
  estimatedCredits: number;
};

export type Chat = {
  id: string;
  requestId: string;
  participantIds: string[];
  isOpen: boolean;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  body: string;
  kind: 'text' | 'system' | 'transfer';
  createdAt: string; // ISO
  meta?: Record<string, any>;
};