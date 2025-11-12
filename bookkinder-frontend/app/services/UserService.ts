import { ApiService } from './ApiService';

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    avatar?: string;
    createdAt: string;
}

export class UserService extends ApiService {

    getUsers(): Promise<User[]> {
        return this.get('api/users');
    }

    getUserById(id: number): Promise<User | null> {
        return this.get(`api/users/${id}`);
    }

    createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
        return this.post('api/users/store', userData);
    }

    updateUser(id: number, userData: Partial<User>): Promise<User> {
        return this.put(`api/users/update/${id}`, userData);
    }

    deleteUser(id: number): Promise<boolean> {
        return this.delete(`api/users/delete/${id}`);
    }

    searchUsers(query: string): Promise<User[]> {
        return this.get(`api/users/search/${query}`);
    }
}
