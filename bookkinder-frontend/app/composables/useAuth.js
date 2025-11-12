import { useUserStore } from '../stores/user';
import { AuthService } from '../services/AuthService';
import { computed } from 'vue';

export const useAuth = () => {
    const store = useUserStore();
    const authService = new AuthService();

    if (typeof window !== 'undefined') {
        store.initFromLocal();
    }

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials.email, credentials.password);

            if (response?.token) {
                store.setToken(response.token);
            }
            if (response?.user) {
                store.setUser(response.user);
            }

            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            store.clearAuth();
            return true;
        } catch (e) {
            console.error('Logout failed:', e);
            return false;
        }
    };

    const isAuthenticated = computed(() => store.isAuthenticated);
    const user = computed(() => store.user);
    const token = computed(() => store.token);

    return { 
        user, 
        token, 
        isAuthenticated,
        login, 
        logout 
    };
};