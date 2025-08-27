import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

import { AppwriteException, ID, Models } from "appwrite";
import { account } from "@/models/client/config";

export interface UserPrefs {
  reputation: number;
  avatar?: string;
}

interface IAuthStore {
  session: Models.Session | null;
  jwt: string | null;
  user: Models.User<UserPrefs> | null;
  hydrated: boolean;
  loading: boolean;
        adminStatus: {
        isAdmin: boolean;
        checked: boolean;
        loading: boolean;
        lastChecked: number; // Timestamp of last admin check
        lastCheckedUserId?: string; // ID of user when last checked
      };
  lastAuthCheck: number; // Timestamp of last auth check
  authCheckInterval: number; // How often to check auth (5 minutes)
  adminCheckInterval: number; // How often to check admin status (30 minutes)

  setHydrated(): void;
  verifySession(): Promise<void>;
  checkAdminStatus(): Promise<void>;
  shouldCheckAuth(): boolean; // Check if we need to verify auth again
  shouldCheckAdmin(): boolean; // Check if we need to verify admin status again
  login(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    error?: AppwriteException | null;
  }>;
  createAccount(
    name: string,
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    error?: AppwriteException | null;
  }>;
  logout(): Promise<void>;
}

function isLocalStorageAvailable() {
  try {
    const testKey = '__test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const STORAGE_VERSION = 3; // Increment this on breaking changes

export const useAuthStore = create<IAuthStore>()(
  persist(
    immer((set, get) => ({
      session: null,
      jwt: null,
      user: null,
      hydrated: false,
      loading: false,
      adminStatus: {
        isAdmin: false,
        checked: false,
        loading: false,
        lastChecked: 0,
        lastCheckedUserId: undefined,
      },
      lastAuthCheck: 0,
      authCheckInterval: 30 * 60 * 1000, // 30 minutes in milliseconds (increased from 5 minutes)
      adminCheckInterval: 2 * 60 * 60 * 1000, // 2 hours in milliseconds (increased from 30 minutes)

      setHydrated() {
        set({ hydrated: true });
      },

      shouldCheckAuth() {
        const { lastAuthCheck, authCheckInterval, user } = get();
        const now = Date.now();
        
        // Always check auth if no user is loaded
        if (!user) {
          return true;
        }
        
        // Check if enough time has passed since last check
        return now - lastAuthCheck > authCheckInterval;
      },

      shouldCheckAdmin() {
        const { adminStatus, adminCheckInterval, user } = get();
        const now = Date.now();
        
        // Always check admin if no user is loaded
        if (!user) {
          return false;
        }
        
        // If admin status was never checked, check it
        if (!adminStatus.checked) {
          return true;
        }
        
        // Force check if user has changed (for debugging)
        const currentUserId = user.$id;
        const lastCheckedUserId = adminStatus.lastCheckedUserId;
        if (currentUserId !== lastCheckedUserId) {
          console.log('🔍 User changed, forcing admin check');
          return true;
        }
        
        // Check if enough time has passed since last admin check
        return now - adminStatus.lastChecked > adminCheckInterval;
      },

      async verifySession() {
        // Check if we need to verify auth again
        if (!get().shouldCheckAuth()) {
          console.log('🔍 Using cached auth status');
          return; // Use cached auth status
        }
        
        console.log('🔍 Performing fresh auth check');

        if (!isLocalStorageAvailable()) {
          console.error('LocalStorage is not available. Please disable privacy mode or use a different browser to login.');
          set({ session: null, user: null, loading: false, lastAuthCheck: Date.now() });
          return;
        }
        set({ loading: true });
        try {
          const session = await account.getSession("current");
          // Session verified successfully
          
          // Also get the user object to see its structure
          try {
            const user = await account.get<UserPrefs>();
            // User object retrieved successfully
            set({ session, user, lastAuthCheck: Date.now() });
            
            // Always check admin status after user is loaded to ensure accuracy
            get().checkAdminStatus();
          } catch {
            // Error retrieving user object
            set({ session, user: null, lastAuthCheck: Date.now() });
          }
        } catch {
          // Session verification failed
          set({ session: null, user: null, lastAuthCheck: Date.now() });
        } finally {
          set({ loading: false });
        }
      },

      async checkAdminStatus() {
        const { user } = get();
        
        if (!user) {
          set({ 
            adminStatus: { 
              isAdmin: false, 
              checked: true, 
              loading: false,
              lastChecked: Date.now(),
              lastCheckedUserId: undefined
            } 
          });
          return;
        }
        
        // Check if we need to verify admin status again
        if (!get().shouldCheckAdmin()) {
          console.log('🔍 Using cached admin status');
          return; // Use cached admin status
        }
        
        console.log('🔍 Performing fresh admin check');

        set({ 
          adminStatus: { 
            isAdmin: false, 
            checked: false, 
            loading: true,
            lastChecked: 0,
            lastCheckedUserId: undefined
          } 
        });

        try {
          // Check if user has admin label
          const labels = user.labels || [];
          const isAdmin = Array.isArray(labels) && labels.includes('admin');
          
          // Also check for case variations and different formats
          const hasAdminLabel = Array.isArray(labels) && (
            labels.includes('admin') ||
            labels.includes('Admin') ||
            labels.includes('ADMIN') ||
            labels.some(label => label.toLowerCase() === 'admin')
          );
          
          console.log('🔍 Admin check:', { 
            labels, 
            isAdmin, 
            hasAdminLabel,
            userId: user.$id,
            userEmail: user.email,
            labelTypes: labels.map(label => typeof label),
            labelLengths: labels.map(label => label?.length),
            userObject: {
              id: user.$id,
              email: user.email,
              name: user.name,
              labels: user.labels,
              prefs: user.prefs
            }
          });
          
          set({ 
            adminStatus: { 
              isAdmin: hasAdminLabel, 
              checked: true, 
              loading: false,
              lastChecked: Date.now(),
              lastCheckedUserId: user.$id
            } 
          });
        } catch (error) {
          console.error('❌ Error checking admin status:', error);
          set({ 
            adminStatus: { 
              isAdmin: false, 
              checked: true, 
              loading: false,
              lastChecked: Date.now(),
              lastCheckedUserId: user?.$id
            } 
          });
        }
      },

      async login(email: string, password: string) {
        if (!isLocalStorageAvailable()) {
          alert('LocalStorage is not available. Please disable privacy mode or use a different browser to login.');
          return { success: false, error: null };
        }
        try {
          const session = await account.createEmailPasswordSession(
            email,
            password
          );
          const [user, { jwt }] = await Promise.all([
            account.get<UserPrefs>(),
            account.createJWT(),
          ]);
          
            // User object processed successfully
          
          if (!user.prefs?.reputation)
            await account.updatePrefs<UserPrefs>({
              reputation: 0,
            });

          set({ session, user, jwt, lastAuthCheck: Date.now() });

          // Always check admin status after login to ensure accuracy
          get().checkAdminStatus();

          return { success: true };
        } catch (error) {
          // Login error occurred
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        }
      },

      async createAccount(name: string, email: string, password: string) {
        if (!isLocalStorageAvailable()) {
          alert('LocalStorage is not available. Please disable privacy mode or use a different browser to register.');
          return { success: false, error: null };
        }
        try {
          await account.create(ID.unique(), email, password, name);
          return { success: true };
        } catch (error) {
          // Account creation error
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        }
      },

      async logout() {
        try {
          set({ loading: true });
          await account.deleteSessions();
          set({ 
            session: null, 
            jwt: null, 
            user: null, 
            loading: false,
            lastAuthCheck: Date.now(),
            adminStatus: {
              isAdmin: false,
              checked: true,
              loading: false,
              lastChecked: Date.now(),
            }
          });
        } catch {
          // Logout error occurred
          set({ loading: false });
        }
      },

      
    })),
    {
      name: "auth",
      version: STORAGE_VERSION,
      // Optimize storage for faster hydration
      storage: {
        getItem: (name) => {
          try {
            const value = localStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch {
            // Ignore storage errors
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch {
            // Ignore storage errors
          }
        },
      },
      migrate: (persistedState, version) => {
        if (version !== STORAGE_VERSION) {
          // Clear state if version mismatch
          return { 
            session: null, 
            jwt: null, 
            user: null, 
            hydrated: false, 
            loading: false,
            lastAuthCheck: 0,
            authCheckInterval: 30 * 60 * 1000,
            adminStatus: {
              isAdmin: false,
              checked: false,
              loading: false,
              lastChecked: 0,
            }
          } as IAuthStore;
        }
        return persistedState as IAuthStore;
      },
      onRehydrateStorage() {
        return (state, error) => {
          if (!error && state) {
            // Immediately set hydrated to true for faster rendering
            state.setHydrated();
          }
        };
      },
      // Skip hydration if localStorage is not available
      skipHydration: typeof window === 'undefined' || !isLocalStorageAvailable(),
    }
  )
);

export const clearAuthState = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth');
    window.location.reload();
  }
};

// Force auth refresh when needed (e.g., after login/logout)
export const forceAuthRefresh = () => {
  const store = useAuthStore.getState();
  store.lastAuthCheck = 0; // Reset auth check timestamp
  
  // Also reset the global auth initialization state
  if (typeof window !== 'undefined') {
    // Dynamic import to avoid circular dependency
    import('@/app/components/AuthProvider').then(({ resetAuthInitialization }) => {
      resetAuthInitialization();
    });
  }
  
  store.verifySession(); // Force new auth check
};

// Force admin status refresh when needed
export const forceAdminRefresh = () => {
  const store = useAuthStore.getState();
  // Reset admin check timestamp to force fresh check
  store.adminStatus.lastChecked = 0;
  store.adminStatus.checked = false;
  store.adminStatus.lastCheckedUserId = undefined;
  store.checkAdminStatus(); // Force new admin check
};

// Debug function to check auth state
export const debugAuthState = () => {
  const state = useAuthStore.getState();
  console.log('🔍 Auth Debug State:', {
    user: state.user ? { id: state.user.$id, email: state.user.email, labels: state.user.labels } : null,
    adminStatus: state.adminStatus,
    hydrated: state.hydrated,
    loading: state.loading,
    lastAuthCheck: state.lastAuthCheck,
    shouldCheckAuth: state.shouldCheckAuth()
  });
};

// Optimized hook for auth state access - prevents multiple re-renders
export const useAuthState = () => {
  const { user, hydrated, loading, adminStatus } = useAuthStore();
  
  // Return early if not hydrated to prevent unnecessary re-renders
  if (!hydrated) {
    return { 
      user: null, 
      hydrated: false, 
      loading: false, // Don't show loading during hydration
      isAdmin: false,
      adminChecked: false,
      adminLoading: false
    };
  }
  
  // Use cached auth status - only show loading if explicitly loading
  const result = {
    user, 
    hydrated, 
    loading: loading && !adminStatus.checked, // Only show loading if auth check is in progress
    isAdmin: adminStatus.isAdmin,
    adminChecked: adminStatus.checked,
    adminLoading: adminStatus.loading
  };
  
  return result;
};

// Utility function to check if user is admin
export const isAdmin = (user: Models.User<UserPrefs> | null): boolean => {
  if (!user) {
    return false;
  }
  
  // Check different possible label properties
  const labels = user.labels || [];
  
  if (!Array.isArray(labels)) {
    return false;
  }
  
  return labels.includes('admin');
};

// Hook to get admin status - now uses centralized state
export const useAdminStatus = () => {
  const { isAdmin, adminChecked, adminLoading } = useAuthState();
  
  return { 
    isAdmin, 
    loading: adminLoading || !adminChecked 
  };
};


