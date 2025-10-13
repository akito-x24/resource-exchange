'use client';

import { create } from 'zustand';
import type { User, Resource, Request, Chat, Message } from '@/types';

function id() {
  return Math.random().toString(36).slice(2, 10);
}

type State = {
  me: User;
  users: Record<string, User>;
  resources: Resource[];
  requests: Request[];
  chats: Chat[];
  messages: Message[];

  // actions only
  addResource: (r: Omit<Resource, 'id' | 'ownerId' | 'ownerName' | 'status'>) => void;
  createRequest: (
    resourceId: string,
    lenderId: string,
    estimatedCredits: number,
    note?: string
  ) => Request;
  acceptRequest: (requestId: string) => Chat;
  rejectRequest: (requestId: string) => void;
  sendMessage: (chatId: string, senderId: string, body: string) => void;
  sendTransferMessage: (chatId: string, senderId: string, amount: number) => void;
  markComplete: (requestId: string) => void;
};

const initialUsers: User[] = [
  { id: 'u1', name: 'Alex', avatarUrl: 'https://i.pravatar.cc/100?img=12' },
  { id: 'u2', name: 'Sarah', avatarUrl: 'https://i.pravatar.cc/100?img=32' },
  { id: 'u3', name: 'Emily', avatarUrl: 'https://i.pravatar.cc/100?img=18' },
  { id: 'me', name: 'You', avatarUrl: 'https://i.pravatar.cc/100?img=5' },
];

const initialResources: Resource[] = [
  {
    id: 'r1',
    ownerId: 'u1',
    ownerName: 'Alex',
    name: 'High-Quality Camera',
    description: '24.2MP DSLR great for photos and 4K video.',
    dailyRate: 15,
    imageUrl:
      'https://images.unsplash.com/photo-1519183071298-a2962be96f83?q=80&w=1200&auto=format&fit=crop',
    status: 'active',
  },
  {
    id: 'r2',
    ownerId: 'u2',
    ownerName: 'Sarah',
    name: 'Mountain Bike',
    description: 'Hardtail with front suspension. Size M.',
    dailyRate: 25,
    imageUrl:
      'https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop',
    status: 'active',
  },
  {
    id: 'r3',
    ownerId: 'u3',
    ownerName: 'Emily',
    name: 'Projector',
    description: 'Bright 1080p projector for movie nights.',
    dailyRate: 20,
    imageUrl:
      'https://images.unsplash.com/photo-1582711012124-a58fef920196?q=80&w=1200&auto=format&fit=crop',
    status: 'active',
  },
];

export const useAppStore = create<State>((set, get) => ({
  me: initialUsers.find((u) => u.id === 'me')!,
  users: Object.fromEntries(initialUsers.map((u) => [u.id, u])),
  resources: initialResources,
  requests: [
    {
      id: 'req1',
      resourceId: 'r1',
      borrowerId: 'me',
      lenderId: 'u1',
      status: 'pending', // literal fits RequestStatus
      estimatedCredits: 50,
      note: 'Tomorrow afternoon?',
    },
  ],
  chats: [],
  messages: [],

  addResource: (r) =>
    set((state) => ({
      resources: [
        {
          id: id(),
          ownerId: state.me.id,
          ownerName: state.me.name,
          status: 'active',
          ...r,
        },
        ...state.resources,
      ],
    })),

  createRequest: (resourceId, lenderId, estimatedCredits, note) => {
    const newReq: Request = {
      id: id(),
      resourceId,
      borrowerId: get().me.id,
      lenderId,
      status: 'pending' as const,
      estimatedCredits,
      note,
    };
    set((state) => ({ requests: [newReq, ...state.requests] }));
    return newReq;
  },

  acceptRequest: (requestId) => {
    let newChat: Chat | null = null;
    set((state) => {
      const req = state.requests.find((r) => r.id === requestId);
      if (!req) return {}; // no-op → Partial<State>

      const updatedReqs: Request[] = state.requests.map((r) =>
        r.id === requestId ? { ...r, status: 'accepted' as const } : r
      );

      newChat = {
        id: id(),
        requestId,
        participantIds: [req.borrowerId, req.lenderId],
        isOpen: true,
      };

      const msgs: Message[] = [
        {
          id: id(),
          chatId: newChat.id,
          senderId: req.lenderId,
          kind: 'system',
          body: `Request accepted. ${req.estimatedCredits} credits held (mock).`,
          createdAt: new Date().toISOString(),
        },
      ];

      return {
        requests: updatedReqs,
        chats: [newChat, ...state.chats],
        messages: [...state.messages, ...msgs],
      };
    });
    return newChat!;
  },

  rejectRequest: (requestId) =>
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId ? { ...r, status: 'rejected' as const } : r
      ),
      chats: state.chats.filter((c) => c.requestId !== requestId),
    })),

  sendMessage: (chatId, senderId, body) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: id(),
          chatId,
          senderId,
          body,
          kind: 'text',
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  sendTransferMessage: (chatId, senderId, amount) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: id(),
          chatId,
          senderId,
          body: `${amount} credits transferred`,
          kind: 'transfer',
          createdAt: new Date().toISOString(),
          meta: { amount },
        },
      ],
    })),

  markComplete: (requestId) =>
    set((state) => {
      const req = state.requests.find((r) => r.id === requestId);
      if (!req) return {}; // no-op → Partial<State>

      const updatedReqs: Request[] = state.requests.map((r) =>
        r.id === requestId ? { ...r, status: 'completed' as const } : r
      );

      const chat = state.chats.find((c) => c.requestId === requestId);
      const updatedChats = chat
        ? state.chats.map((c) => (c.id === chat.id ? { ...c, isOpen: false } : c))
        : state.chats;

      const msgs = chat
        ? [
            {
              id: id(),
              chatId: chat.id,
              senderId: req.lenderId,
              body: `Transaction completed. Released ${req.estimatedCredits} credits (mock).`,
              kind: 'system',
              createdAt: new Date().toISOString(),
            } as Message,
          ]
        : [];

      return {
        requests: updatedReqs,
        chats: updatedChats,
        messages: [...state.messages, ...msgs],
      };
    }),
}));