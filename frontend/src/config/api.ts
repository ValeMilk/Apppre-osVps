// Configuração da API baseada na variável de ambiente ou proxy relativo
const API_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  baseURL: API_URL,
  
  // Helper para fazer requisições autenticadas
  async fetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || `Erro ${response.status}`);
    }
    
    return response.json();
  },
  
  // Métodos convenientes
  get(endpoint: string) {
    return this.fetch(endpoint);
  },
  
  post(endpoint: string, data: any) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  patch(endpoint: string, data?: any) {
    return this.fetch(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  delete(endpoint: string) {
    return this.fetch(endpoint, {
      method: 'DELETE',
    });
  },
};
