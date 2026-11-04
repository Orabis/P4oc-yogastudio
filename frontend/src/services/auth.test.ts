import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'
import localStorageMock from "../../tests/storage.mock"
import {authService} from "./auth.service.ts";
import {LoginCredentials, RegisterData} from "../types";
import api from "./api.ts";

let credentials: LoginCredentials | RegisterData;

const loginRegisterTest = async (functionName: "login" | "register") => {
    vi.spyOn(api, 'post').mockResolvedValueOnce({
        data: { token: 'fake-token'}
    })
    //  @ts-ignore: Je sais
    await authService[functionName](credentials)
    expect(localStorage.getItem('token')).toBe('fake-token')

}

beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock())
    credentials = {
        email: "test@test",
        password: "test123"
    }
})
afterEach(() => {
    vi.resetAllMocks()
    vi.restoreAllMocks()
})
describe('Authentication tests', () => {
    test('devrait stocker le token au login', async () => {
        await loginRegisterTest("login")
    })
    test('devrait stocker le token au register', async () => {
        await loginRegisterTest("register")
    })
    test('doit vider le localStorage au logout', async () => {
        await loginRegisterTest("login")
        authService.logout()
        expect(localStorage.getItem('token')).toBeNull()
    })
    test('doit update', async () => {
        const initialUser = { id: 1, email: "test@test", firstName: "Ancien Nom" };
        localStorage.setItem('user', JSON.stringify(initialUser));
        const updated = authService.updateCurrentUser({ firstName: "newuser" });

        expect(updated).toEqual({ id: 1, email: "test@test", firstName: "newuser" });
        expect(JSON.parse(<string>localStorage.getItem('user'))).toEqual(updated);
    });
})