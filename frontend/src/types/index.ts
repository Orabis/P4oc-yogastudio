export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  admin: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type LoginCredentials = Pick<User, "email"> & { password: string }
export type RegisterData = Pick<User, "email" | "firstName" | "lastName"> & { password: string }
export type Teacher = Omit<User, "admin" | "email">

export interface Session {
  id: number;
  name: string;
  date: string;
  description: string;
  teacher: Teacher;
  users: number[];
  createdAt?: string;
  updatedAt?: string;
}

export type SessionFormData = Pick<Session, "name" | "date" | "description"> & { teacherId: number }

export interface AuthResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  admin: boolean;
  token: string;
}

export interface formDataValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}