
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  credits: number;
  createdAt: string;
}

export interface GeneratedImage {
  id: string;
  userId: string;
  prompt: string;
  imageUrl: string; // base64 data URL
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  credits: number;
  priceINR: number;
  description: string;
  isActive: boolean;
}

export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export interface Transaction {
  id: string;
  userId: string;
  planId: string;
  status: TransactionStatus;
  utr: string;
  amountINR: number;
  createdAt: string;
  processedAt?: string;
  processedByAdminId?: string;
}
