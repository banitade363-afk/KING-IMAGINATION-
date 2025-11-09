
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Plan, Transaction, GeneratedImage, TransactionStatus } from '../types';
import { ADMIN_EMAIL, ADMIN_PASSWORD, SEED_PLANS, INITIAL_CREDITS } from '../constants';

type ImageMeta = Omit<GeneratedImage, 'imageUrl'>;

interface AuthContextType {
  user: User | null;
  users: User[];
  plans: Plan[];
  transactions: Transaction[];
  images: GeneratedImage[];
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  addTransaction: (plan: Plan, utr: string) => Promise<void>;
  updateTransactionStatus: (transactionId: string, status: TransactionStatus) => Promise<void>;
  updateUserCredits: (userId: string, amount: number, operation: 'add' | 'subtract') => Promise<void>;
  recordImageGeneration: (userId: string, cost: number, imagesData: Omit<GeneratedImage, 'id' | 'createdAt'>[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('users');
      const storedPlans = localStorage.getItem('plans');
      const storedTransactions = localStorage.getItem('transactions');
      const storedSession = localStorage.getItem('session');

      let currentUsers: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      if (currentUsers.length === 0) {
        const adminUser: User = {
          id: 'admin_user',
          email: ADMIN_EMAIL,
          passwordHash: ADMIN_PASSWORD, // In a real app, this would be a hash
          role: 'admin',
          credits: Number.MAX_SAFE_INTEGER,
          createdAt: new Date().toISOString(),
        };
        currentUsers.push(adminUser);
        localStorage.setItem('users', JSON.stringify(currentUsers));
      }
      setUsers(currentUsers);

      setPlans(storedPlans ? JSON.parse(storedPlans) : SEED_PLANS);
      setTransactions(storedTransactions ? JSON.parse(storedTransactions) : []);
      
      // Load images from granular storage to avoid performance issues
      const storedMeta = localStorage.getItem('image_meta');
      const meta: ImageMeta[] = storedMeta ? JSON.parse(storedMeta) : [];
      const loadedImages: GeneratedImage[] = meta.map(m => {
        const imageUrl = localStorage.getItem(`image_data_${m.id}`) || '';
        return { ...m, imageUrl };
      });
      setImages(loadedImages);


      if (storedSession) {
        const sessionUser = JSON.parse(storedSession);
        const fullUser = currentUsers.find(u => u.id === sessionUser.id);
        setUser(fullUser || null);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveData = useCallback(() => {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('plans', JSON.stringify(plans));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    // NOTE: Images are no longer saved in this generic function.
    // They are saved specifically in `recordImageGeneration` to handle performance.
    if (user) {
        const sessionUser = users.find(u => u.id === user.id);
        if (sessionUser) {
            localStorage.setItem('session', JSON.stringify(sessionUser));
            setUser(sessionUser);
        }
    }
  }, [user, users, plans, transactions]);

  useEffect(() => {
    if (!loading) {
      saveData();
    }
  }, [loading, saveData]);


  const login = async (email: string, pass: string): Promise<void> => {
    const foundUser = users.find(u => u.email === email && u.passwordHash === pass);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('session', JSON.stringify(foundUser));
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const signup = async (email: string, pass: string): Promise<void> => {
    if (users.some(u => u.email === email)) {
      throw new Error('User with this email already exists');
    }
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      passwordHash: pass,
      role: 'user',
      credits: INITIAL_CREDITS,
      createdAt: new Date().toISOString(),
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setUser(newUser);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('session', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('session');
  };

  const addTransaction = async (plan: Plan, utr: string) => {
    if (!user) throw new Error("User not logged in");
    const newTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        userId: user.id,
        planId: plan.id,
        status: 'pending',
        utr,
        amountINR: plan.priceINR,
        createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const updateTransactionStatus = async (transactionId: string, status: TransactionStatus) => {
    if (!user || user.role !== 'admin') throw new Error("Unauthorized");
    
    let userToUpdate: User | undefined;
    
    const updatedTransactions = transactions.map(t => {
        if (t.id === transactionId && t.status === 'pending') {
            if (status === 'approved') {
                const plan = plans.find(p => p.id === t.planId);
                userToUpdate = users.find(u => u.id === t.userId);
                if (plan && userToUpdate) {
                    const updatedUsers = users.map(u => u.id === userToUpdate!.id ? { ...u, credits: u.credits + plan.credits } : u);
                    setUsers(updatedUsers);
                }
            }
            return { ...t, status, processedAt: new Date().toISOString(), processedByAdminId: user.id };
        }
        return t;
    });
    setTransactions(updatedTransactions);
  };
  
  const updateUserCredits = async (userId: string, amount: number, operation: 'add' | 'subtract') => {
      setUsers(prevUsers => prevUsers.map(u => {
          if (u.id === userId) {
              const newCredits = operation === 'add' ? u.credits + amount : u.credits - amount;
              return { ...u, credits: Math.max(0, newCredits) };
          }
          return u;
      }));
  };

  const recordImageGeneration = async (userId: string, cost: number, imagesData: Omit<GeneratedImage, 'id' | 'createdAt'>[]) => {
    const newImages: GeneratedImage[] = imagesData.map((data, index) => ({
      ...data,
      id: `img_${Date.now()}_${index}`,
      createdAt: new Date().toISOString(),
    }));

    // Update state first for UI responsiveness
    setUsers(prevUsers => prevUsers.map(u =>
      u.id === userId ? { ...u, credits: Math.max(0, u.credits - cost) } : u
    ));
    setImages(prevImages => [...prevImages, ...newImages]);
    
    // Defer saving to localStorage to prevent blocking the UI thread
    setTimeout(() => {
      try {
        const storedMeta = localStorage.getItem('image_meta');
        const meta: ImageMeta[] = storedMeta ? JSON.parse(storedMeta) : [];

        newImages.forEach(img => {
          const { imageUrl, ...rest } = img;
          meta.push(rest);
          localStorage.setItem(`image_data_${img.id}`, imageUrl);
        });

        localStorage.setItem('image_meta', JSON.stringify(meta));
      } catch (error) {
        console.error("Failed to save images to localStorage", error);
        // In a real app, you might want to handle this error more gracefully
      }
    }, 0);
  };

  return (
    <AuthContext.Provider value={{ user, users, plans, transactions, images, loading, login, signup, logout, addTransaction, updateTransactionStatus, updateUserCredits, recordImageGeneration }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
