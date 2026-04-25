export interface RegisterDTO {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    roles: string[];
  };
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}