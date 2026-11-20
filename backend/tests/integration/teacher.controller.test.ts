import {afterAll, beforeAll, beforeEach, describe, expect, test} from 'vitest'
import {createTeacher, createUser, request, resetDb, startServer, stopServer} from "./helpers";

let token: string

beforeAll(startServer)
afterAll(stopServer)
beforeEach(async () => {
    await resetDb()
    token = (await createUser()).token
})

describe('GET /api/teacher', () => {
    test('retourne la liste des profs', async () => {
        await createTeacher()
        await createTeacher()

        const res = await request('/api/teacher', {token})

        expect(res.status).toBe(200)
        expect(await res.json()).toHaveLength(2)
    })
    test('refuse sans token', async () => {
        const res = await request('/api/teacher')
        expect(res.status).toBe(401)
        expect(await res.json()).toEqual({message: 'No token provided'})
    })
    test('refuse un token invalide', async () => {
        const res = await request('/api/teacher', {token: 'faux-token'})
        expect(res.status).toBe(401)
        expect(await res.json()).toEqual({message: 'Invalid or expired token'})
    })
    test('refuse un header sans Bearer token', async () => {
        const res = await request('/api/teacher', {headers: {Authorization: 'Bearer'}})
        expect(res.status).toBe(401)
        expect(await res.json()).toEqual({message: 'Invalid token format'})
    })
})

describe('GET /api/teacher/:id', () => {
    test('retourne le prof', async () => {
        const teacher = await createTeacher()

        const res = await request(`/api/teacher/${teacher.id}`, {token})

        expect(res.status).toBe(200)
        expect(await res.json()).toMatchObject({id: teacher.id, firstName: 'Margot', lastName: 'Delahaye'})
    })
    test('retourne 404 si le prof existe pas', async () => {
        const res = await request('/api/teacher/999', {token})
        expect(res.status).toBe(404)
        expect(await res.json()).toEqual({message: 'Teacher not found'})
    })
    test('retourne 400 si l\'id est pas un nombre', async () => {
        const res = await request('/api/teacher/abc', {token})
        expect(res.status).toBe(400)
    })
})
