export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  nom: string;
  email: string;
  motDePasse: string;
  role: string;
  portfolio?: string;
}

export interface AuthResponse {
  id: number;
  token: string;
  role: string;
  email: string;
  nom: string;
  status: string;
}