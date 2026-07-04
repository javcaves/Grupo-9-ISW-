import { api } from './api';

const URL = "/auth";

export const AuthService = {
    
    login(credentials) {
        return api.post( `${URL}/login`, credentials);
    },

    logout() {
        return api.post(`${URL}/logout`);
    },

    me() {
        return api.get(`${URL}/me`);
    }
}