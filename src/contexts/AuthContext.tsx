import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, database } from '../firebase';
import { ref, get, set } from 'firebase/database';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authorized: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
        try {
          const usersRef = ref(database, 'authorized_users');
          const snapshot = await get(usersRef);
          
          let isAuthorized = false;
          let userExistsInDb = false;
          let isUserActive = true;
          const emailToFind = firebaseUser.email?.trim().toLowerCase();

          if (snapshot.exists()) {
            const data = snapshot.val();
            if (data) {
              const list = Array.isArray(data) ? data : Object.values(data);
              for (const item of list) {
                if (item && typeof item === 'object') {
                  const itemEmail = item.email ? String(item.email).trim().toLowerCase() : '';
                  if (itemEmail === emailToFind) {
                    userExistsInDb = true;
                    isUserActive = item.active === true || item.active === 'true' || item.active === undefined;
                    break;
                  }
                }
              }
            }
          }

          // Se o usuário já está no banco e está ativo, ou se não está no banco ainda (nova conta ou logando pela primeira vez)
          if (!userExistsInDb) {
            isAuthorized = true;
            try {
              const newUserRef = ref(database, `authorized_users/${firebaseUser.uid}`);
              await set(newUserRef, {
                email: emailToFind,
                active: true,
                name: firebaseUser.displayName || 'Usuário'
              });
            } catch (err) {
              console.error('Falha ao registrar novo usuário autorizado no banco:', err);
            }
          } else {
            isAuthorized = isUserActive;
          }

          if (isAuthorized) {
            setUser(firebaseUser);
            setAuthorized(true);
          } else {
            setUser(null);
            setAuthorized(false);
            await signOut(auth);
            toast.error('E-mail não autorizado ou conta inativa no sistema.');
          }
        } catch (error: any) {
          console.error('Erro na validação do Realtime Database:', error);
          setUser(null);
          setAuthorized(false);
          await signOut(auth);
          toast.error(`Falha na autenticação: ${error.message || 'Erro de conexão'}`);
        }
      } else {
        setUser(null);
        setAuthorized(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, authorized, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}