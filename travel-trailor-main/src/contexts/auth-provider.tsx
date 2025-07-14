
'use client';

import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import {
  onAuthStateChanged,
  User,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type Auth,
} from 'firebase/auth';
import { app, db, auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateUserProfile: (name: string) => Promise<void>;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      const isAuthPage = pathname === '/login' || pathname === '/register';

      if (user) {
        if (isAuthPage || pathname === '/') {
          router.push('/dashboard');
        }
      } else {
        if (!isAuthPage && pathname !== '/') {
          router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const signInWithEmail = (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (!auth || !db) throw new Error("Firebase Auth or DB not initialized");
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    await Promise.all([
        updateProfile(firebaseUser, { displayName: name }),
        setDoc(doc(db, 'users', firebaseUser.uid), {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: name,
            createdAt: serverTimestamp(),
        })
    ]);
    
    // This is crucial to ensure the local user state is updated immediately.
    const updatedUser = { ...firebaseUser, displayName: name };
    setUser(updatedUser as User);
    
    return userCredential;
  };

  const signOut = () => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    setUser(null);
    return firebaseSignOut(auth);
  };

  const updateUserProfile = async (name: string) => {
    if (!user || !db || !auth.currentUser) throw new Error('User not authenticated');
    
    await updateProfile(auth.currentUser, { displayName: name });
    await updateDoc(doc(db, 'users', user.uid), { displayName: name });

    // Manually update local user state
    setUser({ ...user, displayName: name });
  };

  const changeUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) throw new Error('User not authenticated');

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      updateUserProfile,
      changeUserPassword,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading]
  );
  
  const isAuthFlow = ['/login', '/register', '/'].includes(pathname);

  if (loading && !isAuthFlow) {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
