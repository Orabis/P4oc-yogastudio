import {afterAll, beforeAll, beforeEach, describe, expect, test} from 'vitest'
import {createUser, prisma, request, resetDb, startServer, stopServer} from "./helpers";

const newUser = {email: 'new@test.com', password: 'password123', firstName: 'Jane', lastName: 'Doe'}

beforeAll(startServer)
afterAll(stopServer)
beforeEach(resetDb)

describe('POST /api/auth/register', () => {
    test('crée le compte et retourne un token', async () => {
        const res = await request('/api/auth/register', {method: 'POST', body: newUser})
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toMatchObject({email: 'new@test.com', firstName: 'Jane', admin: false})
        expect(body.token).toBeDefined()
        expect(body).not.toHaveProperty('password')
        const saved = await prisma.user.findUnique({where: {email: 'new@test.com'}})
        expect(saved?.password).not.toBe('password123')
    })
    test('refuse un email déjà utilisé', async () => {
        await createUser('new@test.com')
        const res = await request('/api/auth/register', {method: 'POST', body: newUser})
        expect(res.status).toBe(409)
        expect(await res.json()).toEqual({message: 'User already exists'})
    })
    test('refuse un body invalide', async () => {
        const res = await request('/api/auth/register', {method: 'POST', body: {...newUser, email: 'pas-un-email'}})
        const body = await res.json()

        expect(res.status).toBe(400)
        expect(body.message).toBe('Validation error')
        expect(body.errors[0].path).toBe('email')
    })
})

describe('POST /api/auth/login', () => {
    test('connecte le user et retourne un token', async () => {
        await createUser()

        const res = await request('/api/auth/login', {method: 'POST', body: {email: 'user@test.com', password: 'test!1234'}})
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toMatchObject({email: 'user@test.com', admin: false})
        expect(body.token).toBeDefined()
        expect(body).not.toHaveProperty('password')
    })
    test('refuse un mauvais mot de passe', async () => {
        await createUser()
        const res = await request('/api/auth/login', {method: 'POST', body: {email: 'user@test.com', password: 'mauvais!'}})
        expect(res.status).toBe(401)
        expect(await res.json()).toEqual({message: 'Invalid credentials'})
    })
    test('refuse un email inconnu', async () => {
        const res = await request('/api/auth/login', {method: 'POST', body: {email: 'nope@test.com', password: 'test!1234'}})
        expect(res.status).toBe(401)
    })
})
