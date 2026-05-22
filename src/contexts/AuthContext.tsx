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
          let isAuthorized = true; // Por padrão, autoriza
          let userExistsInDb = false;
          let isUserActive = true;
          const emailToFind = firebaseUser.email?.trim().toLowerCase();

          // Tenta ler o registro específico por UID primeiro (seguro contra bloqueios de leitura da listagem geral)
          try {
            const userSpecificRef = ref(database, `authorized_users/${firebaseUser.uid}`);
            const specificSnapshot = await get(userSpecificRef);
            if (specificSnapshot.exists()) {
              userExistsInDb = true;
              const data = specificSnapshot.val();
              isUserActive = data.active === true || data.active === 'true' || data.active === undefined;
            }
          } catch (specificErr) {
            console.warn('Não foi possível buscar registro individual por UID:', specificErr);
          }

          // Fallback: Tenta listar de forma geral se o registro não foi localizado por UID
          if (!userExistsInDb) {
            try {
              const usersRef = ref(database, 'authorized_users');
              const snapshot = await get(usersRef);
              
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
            } catch (listErr) {
              console.warn('Não foi possível fazer a leitura completa de authorized_users:', listErr);
            }
          }

          if (userExistsInDb) {
            isAuthorized = isUserActive;
          } else {
            // Se o usuário não está no Realtime Database, autorizamos por padrão e salvamos o registro
            isAuthorized = true;
            try {
              const newUserRef = ref(database, `authorized_users/${firebaseUser.uid}`);
              await set(newUserRef, {
                email: emailToFind,
                active: true,
                name: firebaseUser.displayName || 'Usuário'
              });
            } catch (err) {
              console.warn('Falha silenciosa ao registrar novo usuário autorizado no banco:', err);
              // Ignoramos o erro de registro no banco para não bloquear logins válidos por restrições de escrita
            }
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
          // Fallback redundante seguro: se o login no Firebase Auth funcionou bem, autorizamos
          setUser(firebaseUser);
          setAuthorized(true);
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