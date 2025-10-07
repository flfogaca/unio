const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface ApiResponse<T = any> {
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
    
    // Sempre buscar o token atual do localStorage
    const currentToken = localStorage.getItem('token');
    console.log('API Request to:', url, 'Token:', currentToken ? 'Present' : 'Missing');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (currentToken) {
      headers.Authorization = `Bearer ${currentToken}`;
      console.log('Authorization header set:', `Bearer ${currentToken.substring(0, 20)}...`);
    } else {
      console.log('No token found, request will be unauthenticated');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request('/simple-auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request('/simple-auth/profile');
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

  async createConsultation(consultationData: any) {
    return this.request('/consultations', {
      method: 'POST',
      body: JSON.stringify(consultationData),
    });
  }

  async getConsultation(id: string) {
    return this.request(`/consultations/${id}`);
  }

  async updateConsultation(id: string, data: any) {
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

  async updateProfessionalAvailability(data: any) {
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
    return this.request(`/wait-time/specialties?specialties=${specialtiesParam}`);
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

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Medical records endpoints
  async getMedicalRecords() {
    return this.request('/medical-records');
  }

  async createMedicalRecord(data: any) {
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
    console.log('💬 API: Enviando mensagem ao backend:', data);
    return this.request('/chat/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getChatMessages(consultationId: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    console.log('📥 API: Buscando mensagens do backend para:', consultationId);
    return this.request(`/chat/messages/${consultationId}${params}`, {
      method: 'GET',
    });
  }

  async getChatMessagesSince(consultationId: string, since: Date) {
    const sinceISO = since.toISOString();
    console.log('🔄 API: Buscando mensagens novas desde:', sinceISO);
    return this.request(`/chat/messages/${consultationId}?since=${sinceISO}`, {
      method: 'GET',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
