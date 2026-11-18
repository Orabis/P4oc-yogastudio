import {beforeEach, describe, expect, test, vi} from 'vitest'
import {UserService} from "../../src/service/user.service";
import {UsersRepository} from "../../src/repository/users.repository";
import {UserNotFoundError} from "../../src/utils/HttpErrorHandler.util";

const user = {
    id: 1,
    email: 'user@test.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashed',
    admin: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
}

const usersRepository = {
    findById: vi.fn(),
    deleteUser: vi.fn(),
    updateUser: vi.fn(),
}
const userService = new UserService(usersRepository as unknown as UsersRepository)

beforeEach(() => {
    vi.resetAllMocks()
})

describe('UserService getUserId', () => {
    test('retourne le user sans le mot de passe', async () => {
        usersRepository.findById.mockResolvedValue(user)

        const result = await userService.getUserId(1)

        expect(result).not.toHaveProperty('password')
        expect(result.email).toBe('user@test.com')
    })
    test('throw si le user existe pas', async () => {
        usersRepository.findById.mockResolvedValue(null)
        await expect(userService.getUserId(99)).rejects.toThrow(UserNotFoundError)
    })
})

describe('UserService deleteUser', () => {
    test('supprime le user', async () => {
        usersRepository.findById.mockResolvedValue(user)
        await userService.deleteUser(1)
        expect(usersRepository.deleteUser).toHaveBeenCalledWith(1)
    })
    test('ne supprime rien si le user existe pas', async () => {
        usersRepository.findById.mockResolvedValue(null)
        await expect(userService.deleteUser(99)).rejects.toThrow(UserNotFoundError)
        expect(usersRepository.deleteUser).not.toHaveBeenCalled()
    })
})

describe('UserService updateToAdmin', () => {
    test('passe le user en admin et cache le mot de passe', async () => {
        usersRepository.findById.mockResolvedValue(user)
        usersRepository.updateUser.mockResolvedValue({...user, admin: true})

        const result = await userService.updateToAdmin(1)

        expect(usersRepository.updateUser).toHaveBeenCalledWith(1, {admin: true})
        expect(result.admin).toBe(true)
        expect(result).not.toHaveProperty('password')
    })
    test('throw si le user existe pas', async () => {
        usersRepository.findById.mockResolvedValue(null)
        await expect(userService.updateToAdmin(99)).rejects.toThrow(UserNotFoundError)
        expect(usersRepository.updateUser).not.toHaveBeenCalled()
    })
})
