const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const currentToken = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (currentToken) {
      headers.Authorization = `Bearer ${currentToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        this.token = null;
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request('/simple-auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: Record<string, unknown>) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request('/simple-auth/profile');
  }

  async validateExternalToken(
    token: string
  ): Promise<{ valid: boolean; userData?: any }> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false };
      }

      const payload = JSON.parse(atob(parts[1])) as {
        exp?: number;
        Id?: number;
        id?: number;
        sub?: string;
      };

      const exp = payload.exp;
      if (exp) {
        const now = Math.floor(Date.now() / 1000);
        if (exp < now) {
          return { valid: false };
        }
      }

      const userId = payload.Id || payload.id || payload.sub;

      if (!userId) {
        console.error('ID do usuário não encontrado no token');
        return { valid: false };
      }

      const externalApiUrl = 'https://homolog.uniogroup.app/api/Usuario';
      const response = await fetch(`${externalApiUrl}/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        return { valid: true, userData };
      }

      return { valid: false };
    } catch (error) {
      console.error('Erro ao validar token externo:', error);
      return { valid: false };
    }
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Consultations endpoints
  async getConsultations() {
    return this.request('/consultations');
  }

  async createConsultation(consultationData: Record<string, unknown>) {
    return this.request('/consultations', {
      method: 'POST',
      body: JSON.stringify(consultationData),
    });
  }

  async getConsultation(id: string) {
    return this.request(`/consultations/${id}`);
  }

  async updateConsultation(id: string, data: Record<string, unknown>) {
    return this.request(`/consultations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Consultation actions
  async assumeConsultation(id: string) {
    return this.request(`/consultations/${id}/assume`, {
      method: 'PATCH',
    });
  }

  async startConsultation(id: string) {
    return this.request(`/consultations/${id}/start`, {
      method: 'PATCH',
    });
  }

  async finishConsultation(id: string, notes?: string) {
    return this.request(`/consultations/${id}/finish`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  }

  async cancelConsultation(id: string, reason?: string) {
    return this.request(`/consultations/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  // Availability endpoints
  async getSpecialtyAvailability(specialty: string) {
    return this.request(`/availability/specialty/${specialty}`);
  }

  async getAllSpecialtiesAvailability() {
    return this.request('/availability/specialties');
  }

  async getProfessionalAvailability() {
    return this.request('/availability/professional');
  }

  async updateProfessionalAvailability(data: Record<string, unknown>) {
    return this.request('/availability/professional', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Wait time endpoints
  async getSpecialtyWaitTime(specialty: string) {
    return this.request(`/wait-time/specialty/${specialty}`);
  }

  async getSpecialtiesWaitTimes(specialties: string[]) {
    const specialtiesParam = specialties.join(',');
    return this.request(
      `/wait-time/specialties?specialties=${specialtiesParam}`
    );
  }

  async getConsultationWaitTime(consultationId: string) {
    return this.request(`/wait-time/consultation/${consultationId}`);
  }

  async getQueueStatistics(specialty: string) {
    return this.request(`/wait-time/statistics/${specialty}`);
  }

  // Users endpoints
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, data: Record<string, unknown>) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Medical records endpoints
  async getMedicalRecords() {
    return this.request('/medical-records');
  }

  async createMedicalRecord(data: Record<string, unknown>) {
    return this.request('/medical-records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMedicalRecord(id: string) {
    return this.request(`/medical-records/${id}`);
  }

  // Specialties endpoints
  async getSpecialties() {
    return this.request('/specialties');
  }

  // Video endpoints
  async createVideoRoom(consultationId: string) {
    return this.request('/video/room', {
      method: 'POST',
      body: JSON.stringify({ consultationId }),
    });
  }

  async getVideoRoom(roomId: string) {
    return this.request(`/video/room/${roomId}`);
  }

  // Utility methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Chat methods
  async sendChatMessage(data: {
    consultationId: string;
    senderId: string;
    senderName: string;
    senderType: 'paciente' | 'profissional' | 'sistema';
    message: string;
  }) {
    return this.request('/chat/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getChatMessages(consultationId: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/chat/messages/${consultationId}${params}`, {
      method: 'GET',
    });
  }

  async getChatMessagesSince(consultationId: string, since: Date) {
    const sinceISO = since.toISOString();
    return this.request(`/chat/messages/${consultationId}?since=${sinceISO}`, {
      method: 'GET',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
