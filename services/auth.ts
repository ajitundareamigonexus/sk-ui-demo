import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';
import { SSAPI } from './api';

export interface AuthResponse {
    id?: string | number;
    token?: string;
    role?: string;
    fullName?: string;
    name?: string;
    email?: string;
    mobile?: string;
    message?: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    mobile?: string;
    password: string;
    preferredLoginType?: string;
    role?: string;
    subscriptionPlanId?: string;
}

export interface Role {
    id?: string | number;
    name?: string;
    appName?: string;
    description?: string;
    accessList?: string[];
}

export const loginUserWithPassword = async (email: string, password: string): Promise<AuthResponse> => {
    const sha256Hash = CryptoJS.SHA256(password).toString();
    const bcryptHash = bcrypt.hashSync(sha256Hash, 10);
    const response = await SSAPI.post('/security/tokenManagement/v1/issue', { userId: email, pwd: bcryptHash });
    return response.data;
};

export const registerUser = async (payload: RegisterPayload
): Promise<AuthResponse> => {
    const sha256Hash = CryptoJS.SHA256(payload.password).toString();
    const roleName = payload.role || 'Customer';
    const response = await SSAPI.post('/security/tokenManagement/v1/user', {
        name: payload.name,
        email: payload.email,
        id: payload.email,
        mobile: payload.mobile,
        pwdHash: sha256Hash,
        preferredLoginType:
            payload.preferredLoginType || 'EMAIL',
        roles: [{ name: roleName }],
        ...(payload.subscriptionPlanId && {
            subscriptionPlanId: payload.subscriptionPlanId,
        }),
    }
    );

    return response.data;
};

export const getAllUsers = async (): Promise<AuthResponse[]> => {
    const response = await SSAPI.get('/entityManagement/v1/user');
    return response.data;
};

export const getRoles = async (): Promise<Role[]> => {
    const response = await SSAPI.get('/entityManagement/v1/role');
    return response.data;
};

export const loginUserWithOtp = async (email: string, otp: string): Promise<AuthResponse> => {
    const response = await SSAPI.post('/security/tokenManagement/v1/issue', {
        userId: email, otp
    });
    return response.data;
};

export const bulkAuthorizeFE = async (
    token: string,
    resources: string[],
    operations: string[]
): Promise<boolean[]> => {
    try {
        const response = await SSAPI.post('/security/tokenManagement/v1/authorize/fe/bulk',
            { token, resources, operations },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error('Error in bulk authorization:', error);
        throw error;
    }
};