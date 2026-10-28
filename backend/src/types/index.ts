export interface User {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    admin: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export type LoginCredentials = Pick<User, "email" | "password">
export type RegisterData = Pick<User, "email" | "password" |"firstName" | "lastName" | "admin">
