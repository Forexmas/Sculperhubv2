import { User, KYCStatus, NFT, WalletType, Transaction, TransactionStatus, AccountStatus, UserInvestment } from '../types';

// --- MOCK DATABASE STATE ---
let USERS: User[] = [
  {
    id: 'user-1',
    name: 'Alex Trader',
    email: 'alex@scalperhub.com',
    password: 'password123', // Mock password
    role: 'USER',
    status: 'ACTIVE',
    withdrawal_password: '1234',
    capital: 5000.00,
    accumulating_balance: 1250.50,
    bonus: 100.00,
    profit: 450.00,
    total_won: 15,
    total_loss: 4,
    kycStatus: KYCStatus.UNVERIFIED,
    nfts: [],
    investments: []
  },
  {
    id: 'user-2',
    name: 'Sarah Whale',
    email: 'sarah@whale.capital',
    password: 'password123', // Mock password
    role: 'USER',
    status: 'ACTIVE',
    withdrawal_password: '5678',
    capital: 25000.00,
    accumulating_balance: 5000.00,
    bonus: 500.00,
    profit: 8200.00,
    total_won: 42,
    total_loss: 8,
    kycStatus: KYCStatus.PENDING,
    kycData: {
        fullName: 'Sarah Whale',
        email: 'sarah@whale.capital',
        phone: '+1 555-0123-456',
        dob: '1985-04-12',
        country: 'US',
        address: '88 Wall St, New York, NY',
        occupation: 'Investment Banker',
        sourceOfFunds: 'Salary & Investments',
        taxId: '999-00-1111',
        walletAddress: '0x1234...abcd',
        idType: 'passport',
        idNumber: 'P99887766',
        submittedAt: '2025-05-12T10:00:00Z',
        frontImageUrl: 'https://placehold.co/600x400/10b981/ffffff?text=Passport+Front',
        backImageUrl: 'https://placehold.co/600x400/10b981/ffffff?text=Passport+Back',
        proofOfAddressUrl: 'https://placehold.co/600x400/3b82f6/ffffff?text=Utility+Bill',
        selfieImageUrl: 'https://placehold.co/400x400/8b5cf6/ffffff?text=Selfie+Verified'
    },
    nfts: [],
    investments: []
  },
  {
    id: 'admin-1',
    name: 'Master Admin',
    email: 'admin@scalperhub.com',
    password: 'admin', // Mock password
    role: 'ADMIN',
    status: 'ACTIVE',
    capital: 0,
    accumulating_balance: 0,
    bonus: 0,
    profit: 0,
    total_won: 0,
    total_loss: 0,
    kycStatus: KYCStatus.VERIFIED,
    nfts: [],
    investments: []
  }
];

let TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    userId: 'user-2',
    userName: 'Sarah Whale',
    type: 'DEPOSIT',
    amount: 5000,
    method: 'USDT (TRC20)',
    status: 'PENDING',
    date: '2025-05-12 14:30'
  },
  {
    id: 'tx-2',
    userId: 'user-1',
    userName: 'Alex Trader',
    type: 'WITHDRAWAL',
    amount: 200,
    method: 'BTC Wallet',
    status: 'PENDING',
    date: '2025-05-12 09:15'
  }
];

// --- SYSTEM CONFIG ---
let DEPOSIT_ADDRESSES = {
  BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  ETH: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  USDT: 'TMuA6YqfCeX8EhBFYEg5y7S4DqzSJzpZ5'
};

export const getDepositAddresses = () => {
  return { ...DEPOSIT_ADDRESSES };
};

export const updateDepositAddress = (asset: 'BTC' | 'ETH' | 'USDT', address: string) => {
    // Basic mock validation
    if (!address || address.length < 5) {
        throw new Error("Invalid address format");
    }
    DEPOSIT_ADDRESSES[asset] = address;
    return DEPOSIT_ADDRESSES;
};

// --- AUTHENTICATION LOGIC ---

export const loginUser = (email: string, password: string): User => {
    const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Simple mock check
    if (!user) {
        throw new Error("User not found");
    }
    
    if (user.password !== password) {
        throw new Error("Invalid credentials");
    }

    if (user.status !== 'ACTIVE') {
        throw new Error("Account is " + user.status.toLowerCase());
    }

    return user;
};

export const registerUser = (name: string, email: string, password: string): User => {
    if (USERS.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Email already registered");
    }

    // Explicitly setting all financial fields to 0 for new users
    // They must be credited by Admin
    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        role: 'USER',
        status: 'ACTIVE',
        capital: 0,
        accumulating_balance: 0,
        bonus: 0,
        profit: 0,
        total_won: 0,
        total_loss: 0,
        kycStatus: KYCStatus.UNVERIFIED,
        nfts: [],
        investments: []
    };

    USERS.push(newUser);
    return newUser;
};


// --- THE "EXCLUSIVE" ENGINE LOGIC ---

// 1. Trade Simulation Logic
export const simulateTrade = (userId: string, amount: number): { success: boolean; profit: number; message: string } => {
  const WIN_RATE = 0.7; // 70% win rate as requested
  const PROFIT_MULTIPLIER = 0.85; // 85% profit on win
  
  const user = USERS.find(u => u.id === userId);
  if (!user) throw new Error("User not found");
  
  if (user.status !== 'ACTIVE') {
    throw new Error("Account is suspended. Contact support.");
  }

  if (user.capital < amount) {
    throw new Error("Insufficient capital");
  }

  const isWin = Math.random() < WIN_RATE;
  
  if (isWin) {
    const profitAmount = amount * PROFIT_MULTIPLIER;
    user.profit += profitAmount;
    user.total_won += 1;
    return { success: true, profit: profitAmount, message: 'Trade Won! Profit added.' };
  } else {
    user.capital -= amount;
    user.total_loss += 1;
    return { success: false, profit: -amount, message: 'Trade Lost. Capital deducted.' };
  }
};

// 2. Admin Injection/Debit Logic
export const adminAdjustFunds = (userId: string, wallet: WalletType, amount: number, type: 'CREDIT' | 'DEBIT') => {
  const user = USERS.find(u => u.id === userId);
  if (!user) throw new Error("User not found");
  
  if (type === 'DEBIT') {
    user[wallet] -= amount;
  } else {
    user[wallet] += amount;
  }
  return user;
};

// 3. User Fund Transfer Logic
export const transferFunds = (userId: string, from: WalletType, to: WalletType, amount: number) => {
    const user = USERS.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    
    if (from === to) throw new Error("Source and destination wallets must be different");
    if (amount <= 0) throw new Error("Invalid transfer amount");
    if (user[from] < amount) throw new Error("Insufficient funds in source wallet");

    // Atomic update
    user[from] -= amount;
    user[to] += amount;

    // Log transaction
    const newTx: Transaction = {
        id: `tr-${Date.now()}`,
        userId,
        userName: user.name,
        type: 'TRANSFER',
        amount,
        method: `${from.toUpperCase().replace('_', ' ')} -> ${to.toUpperCase().replace('_', ' ')}`,
        status: 'APPROVED', // Transfers are instant
        date: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    
    TRANSACTIONS.unshift(newTx);
    return newTx;
};

// 4. NFT Creation Logic
export const createNFT = (userId: string, name: string, ethAmount: number, imageUrl: string) => {
  const user = USERS.find(u => u.id === userId);
  if (!user) throw new Error("User not found");

  const newNFT: NFT = {
    id: `nft-${Date.now()}`,
    name,
    ethAmount,
    imageUrl,
    ownerId: userId
  };
  
  user.nfts.push(newNFT);
  return newNFT;
};

// 5. KYC Logic
export const submitKYC = (userId: string, data: any) => {
  const user = USERS.find(u => u.id === userId);
  if (!user) throw new Error("User not found");
  
  user.kycStatus = KYCStatus.PENDING;
  user.kycData = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      dob: data.dob,
      country: data.country,
      address: data.address,
      occupation: data.occupation,
      sourceOfFunds: data.sourceOfFunds,
      taxId: data.taxId,
      walletAddress: data.walletAddress,
      idType: data.idType,
      idNumber: data.idNumber,
      frontImageUrl: data.frontUrl,
      backImageUrl: data.backUrl,
      proofOfAddressUrl: data.proofUrl,
      selfieImageUrl: data.selfieUrl,
      submittedAt: new Date().toISOString()
  };
  
  return user;
};

export const updateKYCStatus = (userId: string, status: KYCStatus) => {
  const user = USERS.find(u => u.id === userId);
  if (!user) throw new Error("User not found");
  user.kycStatus = status;
  return user;
};

// 6. Account Control Logic
export const toggleUserStatus = (userId: string, status: AccountStatus) => {
    const user = USERS.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    user.status = status;
    return user;
}

export const verifyWithdrawalPassword = (userId: string, pin: string): boolean => {
  const user = USERS.find(u => u.id === userId);
  if (!user) return false;
  return user.withdrawal_password === pin;
};

// 7. Transaction Logic
export const getPendingTransactions = () => TRANSACTIONS.filter(t => t.status === 'PENDING');
export const getUserTransactions = (userId: string) => {
    return TRANSACTIONS.filter(t => t.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const createTransaction = (userId: string, type: 'DEPOSIT' | 'WITHDRAWAL', amount: number, method: string) => {
  const user = USERS.find(u => u.id === userId);
  if (!user) throw new Error("User not found");

  const newTx: Transaction = {
    id: `tx-${Date.now()}`,
    userId,
    userName: user.name,
    type,
    amount,
    method,
    status: 'PENDING',
    date: new Date().toISOString().slice(0, 16).replace('T', ' ')
  };
  
  TRANSACTIONS.unshift(newTx);
  return newTx;
};

export const processTransaction = (txId: string, action: 'APPROVE' | 'REJECT') => {
    const tx = TRANSACTIONS.find(t => t.id === txId);
    if (!tx) throw new Error("Transaction not found");
    
    tx.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    
    // If approved, verify we actually move the money
    if (action === 'APPROVE') {
        const user = USERS.find(u => u.id === tx.userId);
        if (user) {
            if (tx.type === 'DEPOSIT') {
                user.capital += tx.amount;
            } else if (tx.type === 'WITHDRAWAL') {
                // Determine source wallet, default to profit or capital. 
                // For this mock, withdrawal deducts from profit first, then capital
                if (user.profit >= tx.amount) {
                    user.profit -= tx.amount;
                } else {
                    user.capital -= tx.amount;
                }
            }
        }
    }
    return tx;
}

// 8. Global Live Trade Simulation
export interface LiveTrade {
    id: string;
    pair: string;
    type: 'CALL' | 'PUT';
    price: number;
    amount: number;
    user: string;
    result: 'WIN' | 'LOSS';
    payout: number;
    time: string;
}

export const generateDummyTrade = (): LiveTrade => {
    const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT'];
    const types = ['CALL', 'PUT'] as const;
    const users = ['User**84', 'User**92', 'User**11', 'Trader**X', 'Whale**01', 'User**55'];
    
    const amount = Math.floor(Math.random() * 5000) + 100;
    const isWin = Math.random() > 0.4; // 60% win rate for effect
    const payout = isWin ? amount * 0.85 : 0;
    
    return {
        id: `trd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        pair: pairs[Math.floor(Math.random() * pairs.length)],
        type: types[Math.floor(Math.random() * types.length)],
        price: 60000 + Math.random() * 1000,
        amount,
        user: users[Math.floor(Math.random() * users.length)],
        result: isWin ? 'WIN' : 'LOSS',
        payout,
        time: new Date().toLocaleTimeString()
    };
};

export const getRecentGlobalTrades = (count: number = 10): LiveTrade[] => {
    return Array.from({ length: count }, () => generateDummyTrade());
};

// 9. Investment Logic
export const subscribeToInvestment = (userId: string, packageId: string, amount: number, durationMonths: number, dailyRate: number) => {
    const user = USERS.find(u => u.id === userId);
    if (!user) throw new Error("User not found");

    if (user.capital < amount) {
        throw new Error("Insufficient capital balance");
    }

    // Deduct from capital
    user.capital -= amount;

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + durationMonths);

    const newInvestment: UserInvestment = {
        id: `inv-${Date.now()}`,
        packageId,
        packageName: `Tier ${packageId}`, // Simple naming convention
        amount,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dailyInterestRate: dailyRate,
        status: 'ACTIVE',
        accruedInterest: 0
    };

    user.investments.push(newInvestment);

    // Log transaction
    const newTx: Transaction = {
        id: `tx-inv-${Date.now()}`,
        userId,
        userName: user.name,
        type: 'INVESTMENT',
        amount,
        method: `Investment Plan (Tier ${packageId})`,
        status: 'APPROVED',
        date: startDate.toISOString().slice(0, 16).replace('T', ' ')
    };
    TRANSACTIONS.unshift(newTx);

    return newInvestment;
};

// --- DATA ACCESSORS ---
export const getUser = (id: string) => USERS.find(u => u.id === id);
export const getAllUsers = () => USERS;
export const getCurrentUser = () => USERS[0]; // Simulating logged in user
export const getAdminUser = () => USERS.find(u => u.role === 'ADMIN') || USERS[1]; // Simulating logged in admin
export const getSupportLogs = () => [
    { id: 1, user: 'Alex Trader', msg: 'Why is my withdrawal pending?', time: '10m ago', type: 'COMPLAINT' },
    { id: 2, user: 'System', msg: 'Bot #442 detected arbitrage attempt.', time: '1h ago', type: 'ALERT' },
    { id: 3, user: 'Sarah Whale', msg: 'I cannot access my NFT gallery.', time: '2h ago', type: 'SUPPORT' },
];