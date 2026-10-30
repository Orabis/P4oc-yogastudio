import {AxiosError} from "axios";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  admin: boolean;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export type SessionFormData = Pick<Session, "name" | "date" | "description"> & { teacherId: number }

export type AuthResponse = Omit<User, "createdAt" | "updatedAt"> & { token: string }

export interface ParticipationParams {
  sessionId: number;
  userId: number;
}

export interface ApiError {
  message: string;
}

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: AxiosError<ApiError>;
  }
}
