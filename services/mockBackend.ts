import { User, KYCStatus, NFT, WalletType, Transaction, TransactionStatus, AccountStatus, UserInvestment, ChatSession, ChatMessage } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// --- MOCK DATABASE STATE ---
const LOAD_FROM_STORAGE = <T>(key: string, defaultVal: T): T => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultVal;
    } catch (e) {
        return defaultVal;
    }
};

const SAVE_TO_STORAGE = (key: string, val: any) => {
    localStorage.setItem(key, JSON.stringify(val));
};

export interface SupportLog {
    id: string;
    userId: string;
    user: string;
    msg: string;
    time: string;
    type: 'COMPLAINT' | 'ALERT' | 'SUPPORT';
}

// Initial Data (Defaults)
const DEFAULT_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Alex Trader',
    email: 'alex@scalperhub.com',
    password: 'password123',
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
    password: 'password123',
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
    password: 'admin',
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

const DEFAULT_TRANSACTIONS: Transaction[] = [
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

// Load State
let CHAT_SESSIONS: ChatSession[] = LOAD_FROM_STORAGE('DB_CHATS', []);
let USERS: User[] = LOAD_FROM_STORAGE('DB_USERS', DEFAULT_USERS);
let TRANSACTIONS: Transaction[] = LOAD_FROM_STORAGE('DB_TRANSACTIONS', DEFAULT_TRANSACTIONS);
let SUPPORT_LOGS: SupportLog[] = LOAD_FROM_STORAGE('DB_LOGS', [
    { id: 'log-1', userId: 'user-1', user: 'Alex Trader', msg: 'Why is my withdrawal pending?', time: new Date(Date.now() - 1000 * 60 * 10).toISOString(), type: 'COMPLAINT' },
    { id: 'log-2', userId: 'system', user: 'System', msg: 'Bot #442 detected arbitrage attempt.', time: new Date(Date.now() - 1000 * 60 * 60).toISOString(), type: 'ALERT' },
    { id: 'log-3', userId: 'user-2', user: 'Sarah Whale', msg: 'I cannot access my NFT gallery.', time: new Date(Date.now() - 1000 * 60 * 120).toISOString(), type: 'SUPPORT' },
]);

// Helper to persist changes
const persistDB = () => {
    SAVE_TO_STORAGE('DB_USERS', USERS);
    SAVE_TO_STORAGE('DB_TRANSACTIONS', TRANSACTIONS);
    SAVE_TO_STORAGE('DB_CHATS', CHAT_SESSIONS);
    SAVE_TO_STORAGE('DB_LOGS', SUPPORT_LOGS);
};

// Force reload from storage (for polling across tabs)
export const forceUpdate = () => {
    USERS = LOAD_FROM_STORAGE('DB_USERS', DEFAULT_USERS);
    TRANSACTIONS = LOAD_FROM_STORAGE('DB_TRANSACTIONS', DEFAULT_TRANSACTIONS);
    CHAT_SESSIONS = LOAD_FROM_STORAGE('DB_CHATS', []);
    SUPPORT_LOGS = LOAD_FROM_STORAGE('DB_LOGS', []);
};

// Initialize AI
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

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
    persistDB();
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
    persistDB();
    return { success: true, profit: profitAmount, message: 'Trade Won! Profit added.' };
  } else {
    user.capital -= amount;
    user.total_loss += 1;
    persistDB();
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
  persistDB();
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
    persistDB();
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
  persistDB();
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
  
  persistDB();
  return user;
};

export const updateKYCStatus = (userId: string, status: KYCStatus) => {
  const user = USERS.find(u => u.id === userId);
  if (!user) throw new Error("User not found");
  user.kycStatus = status;
  persistDB();
  return user;
};

// 6. Account Control Logic
export const toggleUserStatus = (userId: string, status: AccountStatus) => {
    const user = USERS.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    user.status = status;
    persistDB();
    return user;
}

export const verifyWithdrawalPassword = (userId: string, pin: string): boolean => {
  const user = USERS.find(u => u.id === userId);
  if (!user) return false;
  return user.withdrawal_password === pin;
};

// 7. Transaction Logic
export const getPendingTransactions = () => {
    forceUpdate(); // Re-read from storage to get latest
    return TRANSACTIONS.filter(t => t.status === 'PENDING');
};
export const getUserTransactions = (userId: string) => {
    forceUpdate(); // Re-read from storage
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
  persistDB();
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
    persistDB();
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
    persistDB();

    return newInvestment;
};

// 10. Chat Logic
export const getChatSession = (userId: string): ChatSession => {
    forceUpdate(); // Ensure we have latest chats
    let session = CHAT_SESSIONS.find(s => s.userId === userId);
    if (!session) {
        const user = USERS.find(u => u.id === userId);
        session = {
            userId,
            userName: user?.name || 'Unknown User',
            messages: [
                {
                    id: 'msg-init',
                    senderId: 'BOT',
                    message: 'Hello! I am your AI assistant. How can I help you today?',
                    timestamp: new Date().toISOString(),
                    type: 'BOT'
                }
            ],
            status: 'ACTIVE',
            lastMessageAt: new Date().toISOString(),
            hasUnreadAdminMessage: false
        };
        CHAT_SESSIONS.push(session);
        persistDB();
    }
    return session;
};

export const sendChatMessage = async (userId: string, message: string, isIssue: boolean = false) => {
    const session = getChatSession(userId);
    
    // Add User Message
    const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: userId,
        message,
        timestamp: new Date().toISOString(),
        type: 'USER',
        isIssue
    };
    session.messages.push(userMsg);
    session.lastMessageAt = new Date().toISOString();

    let shouldEscalate = isIssue;
    let escalationReason = isIssue ? "User manually flagged as issue" : "";
    let aiReply = "I'm sorry, I'm having trouble connecting to my brain right now.";

    if (session.status === 'ESCALATED') {
        // Already escalated, don't use AI, just acknowledge
        aiReply = "Your issue is currently being reviewed by a human agent. They will respond here shortly.";
    } else if (isIssue) {
        aiReply = "I have logged your issue and notified a support agent. They will get back to you shortly.";
    } else {
        // AI Response for general queries
        try {
            if (ai) {
                const result = await ai.models.generateContent({
                    model: "gemini-2.0-flash-exp",
                    contents: `User message: "${message}"\n\nContext: You are a support agent for ScalperHub crypto platform. Be helpful and concise. If the user is reporting a bug, missing funds, payment issue, or explicitly asking for a human/admin, you MUST set escalate to true.`,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                reply: { type: Type.STRING, description: "Your response to the user" },
                                escalate: { type: Type.BOOLEAN, description: "True if this needs human admin attention" },
                                reason: { type: Type.STRING, description: "Reason for escalation, if escalate is true" }
                            },
                            required: ["reply", "escalate"]
                        }
                    }
                });
                const data = JSON.parse(result.text || "{}");
                aiReply = data.reply || "I will help you with that.";
                if (data.escalate) {
                    shouldEscalate = true;
                    escalationReason = data.reason || "AI detected a complaint requiring admin attention.";
                }
            } else {
                 // Fallback if no API key
                 const responses = [
                    "I can help with that. Could you provide more details?",
                    "That's an interesting question about our platform.",
                    "You can find more info in the Settings tab.",
                    "Please check the Market page for live rates."
                 ];
                 aiReply = responses[Math.floor(Math.random() * responses.length)];
            }
        } catch (error) {
            console.error("AI Error:", error);
            aiReply = "I'm currently experiencing high traffic. Please try again later.";
        }
    }

    const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: 'BOT',
        message: aiReply,
        timestamp: new Date().toISOString(),
        type: 'BOT'
    };
    session.messages.push(botMsg);

    if (shouldEscalate && session.status !== 'ESCALATED') {
        session.status = 'ESCALATED';
        SUPPORT_LOGS.unshift({
            id: `log-${Date.now()}`,
            userId: userId,
            user: session.userName,
            msg: escalationReason || message,
            time: new Date().toISOString(),
            type: 'COMPLAINT'
        });
    }
    
    persistDB();
    return session;
};

export const adminGetChatSessions = () => {
    forceUpdate(); // Re-read from storage
    return CHAT_SESSIONS.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
};

export const adminReplyToChat = (userId: string, message: string) => {
    const session = CHAT_SESSIONS.find(s => s.userId === userId);
    if (!session) throw new Error("Chat session not found");

    const adminMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: 'ADMIN',
        message,
        timestamp: new Date().toISOString(),
        type: 'ADMIN'
    };
    
    session.messages.push(adminMsg);
    session.lastMessageAt = new Date().toISOString();
    session.hasUnreadAdminMessage = true;
    session.status = 'RESOLVED'; // Admin reply resolves escalation usually, or keeps it active
    
    persistDB();
    return session;
};

export const markChatRead = (userId: string) => {
    const session = CHAT_SESSIONS.find(s => s.userId === userId);
    if (session) {
        session.hasUnreadAdminMessage = false;
        persistDB();
    }
};

// --- DATA ACCESSORS ---
export const getUser = (id: string) => {
    forceUpdate();
    return USERS.find(u => u.id === id);
};
export const getAllUsers = () => {
    forceUpdate();
    return [...USERS];
}; // Return a copy to trigger React state updates if reference changes, but here we want latest data.
// Actually, for the admin panel to see updates, we need to ensure we are returning the live array or a fresh copy of the live data.
// Since USERS is a module-level variable, returning it directly works, but React might not detect changes if the reference is the same.
// However, in AdminPanel we are doing setUsers(getAllUsers()...). filter() creates a new array, so React WILL update.

// The issue might be that USERS isn't being updated correctly across modules? No, it's a singleton module.
// Let's ensure registerUser pushes to the SAME USERS array. It does.

// Let's add a helper to force a "db refresh" simulation if needed, but the polling in AdminPanel should handle it.
// export const forceUpdate = () => {}; // REMOVED DUPLICATE

export const getCurrentUser = () => USERS[0]; // Simulating logged in user
export const getAdminUser = () => USERS.find(u => u.role === 'ADMIN') || USERS[2]; // Simulating logged in admin (index 2 is admin-1)
export const getSupportLogs = () => {
    forceUpdate();
    return [...SUPPORT_LOGS];
};