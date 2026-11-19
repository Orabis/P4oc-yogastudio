import {beforeEach, describe, expect, test, vi} from 'vitest'
import * as bcrypt from "bcrypt";
import {AuthService} from "../../src/service/auth.service";
import {UsersRepository} from "../../src/repository/users.repository";
import {InvalidCredentialsError, UserAlreadyExistsError} from "../../src/utils/HttpErrorHandler.util";
import {verifyToken} from "../../src/utils/jwt.util";

const usersRepository = {
    findByEmail: vi.fn(),
    createNewUser: vi.fn(),
}
const authService = new AuthService(usersRepository as unknown as UsersRepository)

const user = {
    id: 1,
    email: 'user@test.com',
    firstName: 'John',
    lastName: 'Doe',
    password: '',
    admin: false,
}

beforeEach(async () => {
    vi.resetAllMocks()
    user.password = await bcrypt.hash('test!1234', 4)
})

describe('AuthService loginUser', () => {
    test('retourne le user avec un token valide', async () => {
        usersRepository.findByEmail.mockResolvedValue(user)

        const result = await authService.loginUser('user@test.com', 'test!1234')

        expect(result).toMatchObject({id: 1, email: 'user@test.com', admin: false})
        expect(result).not.toHaveProperty('password')
        expect(verifyToken(result.token).userId).toBe(1)
    })
    test('throw si l\'email existe pas', async () => {
        usersRepository.findByEmail.mockResolvedValue(null)
        await expect(authService.loginUser('nope@test.com', 'test!1234')).rejects.toThrow(InvalidCredentialsError)
    })
    test('throw si le mot de passe est faux', async () => {
        usersRepository.findByEmail.mockResolvedValue(user)
        await expect(authService.loginUser('user@test.com', 'mauvais')).rejects.toThrow(InvalidCredentialsError)
    })
})

describe('AuthService registerUser', () => {
    test('crée le user avec un mot de passe hashé et pas admin', async () => {
        usersRepository.findByEmail.mockResolvedValue(null)
        usersRepository.createNewUser.mockImplementation(async (data) => ({id: 2, ...data}))

        const result = await authService.registerUser('new@test.com', 'password123', 'Jane', 'Doe')

        const data = usersRepository.createNewUser.mock.calls[0][0]
        expect(data.admin).toBe(false)
        expect(data.password).not.toBe('password123')
        expect(await bcrypt.compare('password123', data.password)).toBe(true)
        expect(result).toMatchObject({id: 2, email: 'new@test.com', firstName: 'Jane', lastName: 'Doe'})
        expect(verifyToken(result.token).userId).toBe(2)
    })
    test('throw si l\'email est déjà pris', async () => {
        usersRepository.findByEmail.mockResolvedValue(user)

        await expect(authService.registerUser('user@test.com', 'password123', 'John', 'Doe'))
            .rejects.toThrow(UserAlreadyExistsError)
        expect(usersRepository.createNewUser).not.toHaveBeenCalled()
    })
})
