import {afterAll, beforeAll, beforeEach, describe, expect, test} from 'vitest'
import {createSession, createTeacher, createUser, prisma, request, resetDb, startServer, stopServer} from "./helpers";

let admin: Awaited<ReturnType<typeof createUser>>
let user: Awaited<ReturnType<typeof createUser>>
let teacherId: number
let sessionId: number

const newSession = {name: 'Yin Yoga', date: '2026-03-01', description: 'Une pratique relaxante'}

beforeAll(startServer)
afterAll(stopServer)
beforeEach(async () => {
    await resetDb()
    admin = await createUser('yoga@studio.com', true)
    user = await createUser('user@test.com')
    teacherId = (await createTeacher()).id
    sessionId = (await createSession(teacherId)).id
})

describe('GET /api/session', () => {
    test('retourne toutes les sessions', async () => {
        await createSession(teacherId)

        const res = await request('/api/session', {token: user.token})
        const sessions = await res.json()

        expect(res.status).toBe(200)
        expect(sessions).toHaveLength(2)
        expect(sessions[0]).toMatchObject({name: 'Yoga Vinyasa', teacher: {id: teacherId}, users: []})
    })
})

describe('GET /api/session/:id', () => {
    test('retourne la session avec ses participants', async () => {
        await prisma.sessionParticipation.create({data: {sessionId, userId: user.id}})

        const res = await request(`/api/session/${sessionId}`, {token: user.token})

        expect(res.status).toBe(200)
        expect((await res.json()).users).toEqual([user.id])
    })
    test('retourne 404 si la session existe pas', async () => {
        const res = await request('/api/session/999', {token: user.token})
        expect(res.status).toBe(404)
        expect(await res.json()).toEqual({message: 'Session not found'})
    })
})

describe('POST /api/session', () => {
    test('un admin crée une session', async () => {
        const res = await request('/api/session', {method: 'POST', token: admin.token, body: {...newSession, teacherId}})

        expect(res.status).toBe(201)
        expect(await res.json()).toMatchObject({name: 'Yin Yoga', teacher: {id: teacherId}})
        expect(await prisma.session.count()).toBe(2)
    })
    test('un user non admin peut pas créer', async () => {
        const res = await request('/api/session', {method: 'POST', token: user.token, body: {...newSession, teacherId}})
        expect(res.status).toBe(403)
        expect(await prisma.session.count()).toBe(1)
    })
    test('retourne 404 si le prof existe pas', async () => {
        const res = await request('/api/session', {method: 'POST', token: admin.token, body: {...newSession, teacherId: 999}})
        expect(res.status).toBe(404)
        expect(await res.json()).toEqual({message: 'Teacher not found'})
    })
    test('refuse un body invalide', async () => {
        const res = await request('/api/session', {method: 'POST', token: admin.token, body: {name: 'Yo'}})
        expect(res.status).toBe(400)
        expect((await res.json()).message).toBe('Validation error')
    })
})

describe('PUT /api/session/:id', () => {
    test('un admin modifie une session', async () => {
        const res = await request(`/api/session/${sessionId}`, {
            method: 'PUT', token: admin.token, body: {name: 'Hatha', date: '2026-05-10'},
        })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.name).toBe('Hatha')
        expect(body.date).toContain('2026-05-10')
    })
    test('retourne 404 si la session existe pas', async () => {
        const res = await request('/api/session/999', {method: 'PUT', token: admin.token, body: {name: 'Hatha'}})
        expect(res.status).toBe(404)
    })
})

describe('DELETE /api/session/:id', () => {
    test('un admin supprime une session', async () => {
        const res = await request(`/api/session/${sessionId}`, {method: 'DELETE', token: admin.token})

        expect(res.status).toBe(200)
        expect(await prisma.session.findUnique({where: {id: sessionId}})).toBeNull()
    })
    test('un user non admin peut pas supprimer', async () => {
        const res = await request(`/api/session/${sessionId}`, {method: 'DELETE', token: user.token})
        expect(res.status).toBe(403)
        expect(await prisma.session.count()).toBe(1)
    })
})

describe('POST /api/session/:id/participate/:userId', () => {
    test('le user rejoint la session', async () => {
        const res = await request(`/api/session/${sessionId}/participate/${user.id}`, {method: 'POST', token: user.token})

        expect(res.status).toBe(200)
        expect(await prisma.sessionParticipation.count({where: {sessionId, userId: user.id}})).toBe(1)
    })
    test('refuse si le user participe déjà', async () => {
        await prisma.sessionParticipation.create({data: {sessionId, userId: user.id}})

        const res = await request(`/api/session/${sessionId}/participate/${user.id}`, {method: 'POST', token: user.token})

        expect(res.status).toBe(400)
        expect(await res.json()).toEqual({message: 'User already participating in this session'})
    })
    test('retourne 404 si le user existe pas', async () => {
        const res = await request(`/api/session/${sessionId}/participate/999`, {method: 'POST', token: user.token})
        expect(res.status).toBe(404)
        expect(await res.json()).toEqual({message: 'User not found'})
    })
})

describe('DELETE /api/session/:id/participate/:userId', () => {
    test('le user quitte la session', async () => {
        await prisma.sessionParticipation.create({data: {sessionId, userId: user.id}})

        const res = await request(`/api/session/${sessionId}/participate/${user.id}`, {method: 'DELETE', token: user.token})

        expect(res.status).toBe(200)
        expect(await prisma.sessionParticipation.count()).toBe(0)
    })
    test('retourne 404 si le user participe pas', async () => {
        const res = await request(`/api/session/${sessionId}/participate/${user.id}`, {method: 'DELETE', token: user.token})
        expect(res.status).toBe(404)
        expect(await res.json()).toEqual({message: 'Participation not found'})
    })
})
