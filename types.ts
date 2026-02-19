
export enum KYCStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  UNVERIFIED = 'UNVERIFIED'
}

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'LOCKED';

export interface KYCData {
  fullName: string;
  dob: string;
  country: string;
  address: string;
  // Expanded fields
  email: string;
  phone: string;
  occupation: string;
  sourceOfFunds: string;
  taxId?: string;
  walletAddress: string;
  
  idType: string;
  idNumber: string;
  
  // Images
  frontImageUrl?: string;
  backImageUrl?: string;
  proofOfAddressUrl?: string;
  selfieImageUrl?: string;
  
  submittedAt: string;
}

// Mirrors the requested User model structure
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for authentication
  role: 'USER' | 'ADMIN';
  withdrawal_password?: string; // "Pin Code"
  status: AccountStatus;
  
  // Complex Balances
  capital: number;
  accumulating_balance: number;
  bonus: number;
  profit: number;
  
  // Trading Stats
  total_won: number;
  total_loss: number;
  
  kycStatus: KYCStatus;
  kycData?: KYCData;
  
  // Relations
  nfts: NFT[];
  investments: UserInvestment[];
}

export interface NFT {
  id: string;
  name: string;
  ethAmount: number;
  imageUrl: string;
  ownerId: string;
}

export interface InvestmentPackage {
  id: string;
  name: string;
  durationMonths: number;
  dailyInterestRate: number;
  minAmount: number; // Optional constraint
}

export interface UserInvestment {
  id: string;
  packageId: string;
  packageName: string;
  amount: number;
  startDate: string;
  endDate: string;
  dailyInterestRate: number;
  status: 'ACTIVE' | 'COMPLETED';
  accruedInterest: number;
}

export type WalletType = 'profit' | 'bonus' | 'capital' | 'accumulating_balance';

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'INVESTMENT';
export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: TransactionType;
  amount: number;
  method: string; // e.g., 'BTC', 'USDT', 'Bank Transfer', 'Tier 1'
  status: TransactionStatus;
  date: string;
}

// Navigation Types
export type View = 
  | 'DASHBOARD' 
  | 'TRADING' 
  | 'NFT' 
  | 'ADMIN' 
  | 'KYC'
  | 'MARKET'
  | 'DEPOSIT'
  | 'TRANSFER'
  | 'WITHDRAWAL'
  | 'INVESTMENT'
  | 'HISTORY'
  | 'SIGNAL'
  | 'SETTINGS';
