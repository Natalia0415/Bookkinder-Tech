import { useUserStore } from '../stores/user';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type Primitive = string | number | boolean | null | undefined;
type JsonLike = Record<string, unknown>;
type BodyInput = JsonLike | string | Blob | FormData | null | undefined;

interface RequestOptions<TBody = BodyInput, TParams extends Record<string, Primitive> = Record<string, Primitive>> {
    method?: HttpMethod;
    body?: TBody;
    params?: TParams;
    headers?: Record<string, string>;
}

export class ApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://api.bookkinder.test';
    }

    private getAuthHeaders(): Record<string, string> {
        const userStore = useUserStore();
        const token = userStore.token;
        // Estándar: "Authorization: Bearer <token>"
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    async request<TResponse, TBody extends BodyInput = undefined, TParams extends Record<string, Primitive> = Record<string, Primitive>>(
        endpoint: string,
        options: RequestOptions<TBody, TParams> = {}
    ): Promise<TResponse> {
        const { method = 'GET', body, params, headers } = options;

        return await $fetch<TResponse>(`${this.baseUrl}/${endpoint}`, {
            method,
            body,
            params,
            headers: {
                Accept: 'application/json',
                ...(body !== undefined && body !== null ? { 'Content-Type': 'application/json' } : {}),
                ...this.getAuthHeaders(),
                ...headers,
            }
        });
    }

    get<TResponse, TParams extends Record<string, Primitive> = Record<string, Primitive>>(endpoint: string, params?: TParams) {
        return this.request<TResponse, undefined, TParams>(endpoint, { method: 'GET', params });
    }

    post<TResponse, TBody extends BodyInput = JsonLike>(endpoint: string, body?: TBody) {
        return this.request<TResponse, TBody>(endpoint, { method: 'POST', body });
    }

    put<TResponse, TBody extends BodyInput = JsonLike>(endpoint: string, body?: TBody) {
        return this.request<TResponse, TBody>(endpoint, { method: 'PUT', body });
    }

    delete<TResponse>(endpoint: string) {
        return this.request<TResponse>(endpoint, { method: 'DELETE' });
    }
}
