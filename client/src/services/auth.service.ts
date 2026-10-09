import api from './api';
import type { AuthUser } from '@shared/types/api';

export const authService = {
    async register(name: string, email: string, password: string): Promise<AuthUser> {
        const { data } = await api.post('/auth/register', { name, email, password });
        return data.data;
    },

    async login(email: string, password: string): Promise<AuthUser> {
        const { data } = await api.post('/auth/login', { email, password });
        return data.data;
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout');
    },

    async me(): Promise<AuthUser> {
        const { data } = await api.get('/auth/me');
        return data.data;
    },
};
