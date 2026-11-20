import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi} from 'vitest'
import {createUser, prisma, request, resetDb, startServer, stopServer} from "./helpers";

let user: Awaited<ReturnType<typeof createUser>>

beforeAll(startServer)
afterAll(stopServer)
beforeEach(async () => {
    await resetDb()
    user = await createUser()
})
afterEach(() => {
    vi.unstubAllEnvs()
})

describe('GET /api/user/:id', () => {
    test('retourne le user sans le mot de passe', async () => {
        const res = await request(`/api/user/${user.id}`, {token: user.token})
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toMatchObject({id: user.id, email: 'user@test.com', admin: false})
        expect(body).not.toHaveProperty('password')
    })
    test('retourne 404 si le user existe pas', async () => {
        const res = await request('/api/user/999', {token: user.token})
        expect(res.status).toBe(404)
        expect(await res.json()).toEqual({message: 'User not found'})
    })
    test('retourne 400 si l\'id est invalide', async () => {
        const res = await request('/api/user/-1', {token: user.token})
        expect(res.status).toBe(400)
        expect(await res.json()).toEqual({message: 'Invalid user id'})
    })
})

describe('DELETE /api/user/:id', () => {
    test('supprime son propre compte', async () => {
        const res = await request(`/api/user/${user.id}`, {method: 'DELETE', token: user.token})

        expect(res.status).toBe(200)
        expect(await prisma.user.findUnique({where: {id: user.id}})).toBeNull()
    })
    test('peut pas supprimer le compte d\'un autre', async () => {
        const other = await createUser('other@test.com')

        const res = await request(`/api/user/${other.id}`, {method: 'DELETE', token: user.token})

        expect(res.status).toBe(403)
        expect(await prisma.user.findUnique({where: {id: other.id}})).not.toBeNull()
    })
    test('retourne 404 si le compte est déjà supprimé', async () => {
        await prisma.user.delete({where: {id: user.id}})
        const res = await request(`/api/user/${user.id}`, {method: 'DELETE', token: user.token})
        expect(res.status).toBe(404)
    })
})

describe('POST /api/user/promote-admin', () => {
    test('passe le user en admin en dev', async () => {
        vi.stubEnv('NODE_ENV', 'development')

        const res = await request('/api/user/promote-admin', {method: 'POST', token: user.token})
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.admin).toBe(true)
        expect(body).not.toHaveProperty('password')
    })
    test('refuse hors dev', async () => {
        vi.stubEnv('NODE_ENV', 'production')

        const res = await request('/api/user/promote-admin', {method: 'POST', token: user.token})

        expect(res.status).toBe(403)
        expect((await prisma.user.findUnique({where: {id: user.id}}))?.admin).toBe(false)
    })
})
