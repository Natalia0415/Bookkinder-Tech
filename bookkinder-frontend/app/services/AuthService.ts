import { ApiService } from './ApiService';

export class AuthService extends ApiService {

    async login(email: string, password: string) {
        return this.post('api/auth/login', { email, password });
    }

    async logout() {
        return this.post('api/auth/logout', {});
    }

    async getProfile() {
        return this.get('api/auth/profile');
    }
}