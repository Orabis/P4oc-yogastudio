import {beforeEach, describe, expect, test, vi} from 'vitest'
import {SessionService} from "../../src/service/session.service";
import {SessionsRepository} from "../../src/repository/sessions.repository";
import {TeachersRepository} from "../../src/repository/teachers.repository";
import {UsersRepository} from "../../src/repository/users.repository";
import {
    AlreadyParticipatingError,
    ForbiddenError,
    ParticipationNotFoundError,
    SessionNotFoundError,
    TeacherNotFoundError,
    UserNotFoundError,
} from "../../src/utils/HttpErrorHandler.util";

const sessionsRepository = {
    findMany: vi.fn(),
    findById: vi.fn(),
    createSession: vi.fn(),
    updateSession: vi.fn(),
    deleteSession: vi.fn(),
    findParticipation: vi.fn(),
    createParticipation: vi.fn(),
    deleteParticipation: vi.fn(),
}
const teachersRepository = {findById: vi.fn()}
const usersRepository = {findById: vi.fn()}

const sessionService = new SessionService(
    sessionsRepository as unknown as SessionsRepository,
    teachersRepository as unknown as TeachersRepository,
    usersRepository as unknown as UsersRepository,
)

const teacher = {id: 1, firstName: 'Margot', lastName: 'Delahaye'}
const admin = {id: 1, admin: true}
const simpleUser = {id: 2, admin: false}
const session = {
    id: 1,
    name: 'Yoga Vinyasa',
    date: new Date('2026-02-15'),
    description: 'Un cours dynamique',
    teacherId: 1,
    teacher,
    participants: [{user: {id: 2}}, {user: {id: 3}}],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
}
const newSession = {name: 'Yin Yoga', date: '2026-03-01', description: 'Relaxant', teacherId: 1}

beforeEach(() => {
    vi.resetAllMocks()
})

describe('SessionService lecture', () => {
    test('getAll formate les sessions avec les ids des participants', async () => {
        sessionsRepository.findMany.mockResolvedValue([session])

        const sessions = await sessionService.getAll()

        expect(sessions[0].users).toEqual([2, 3])
        expect(sessions[0].teacher).toEqual(teacher)
        expect(sessions[0]).not.toHaveProperty('participants')
    })
    test('getById retourne la session', async () => {
        sessionsRepository.findById.mockResolvedValue(session)
        const result = await sessionService.getById(1)
        expect(result.name).toBe('Yoga Vinyasa')
    })
    test('getById throw si la session existe pas', async () => {
        sessionsRepository.findById.mockResolvedValue(null)
        await expect(sessionService.getById(99)).rejects.toThrow(SessionNotFoundError)
    })
})

describe('SessionService create', () => {
    test('un admin peut créer une session', async () => {
        usersRepository.findById.mockResolvedValue(admin)
        teachersRepository.findById.mockResolvedValue(teacher)
        sessionsRepository.createSession.mockResolvedValue({...session, participants: []})

        const result = await sessionService.create(1, newSession)

        expect(sessionsRepository.createSession).toHaveBeenCalledWith({...newSession, date: new Date('2026-03-01')})
        expect(result.users).toEqual([])
    })
    test('un user non admin peut pas créer', async () => {
        usersRepository.findById.mockResolvedValue(simpleUser)
        await expect(sessionService.create(2, newSession)).rejects.toThrow(ForbiddenError)
        expect(sessionsRepository.createSession).not.toHaveBeenCalled()
    })
    test('throw si le prof existe pas', async () => {
        usersRepository.findById.mockResolvedValue(admin)
        teachersRepository.findById.mockResolvedValue(null)
        await expect(sessionService.create(1, newSession)).rejects.toThrow(TeacherNotFoundError)
        expect(sessionsRepository.createSession).not.toHaveBeenCalled()
    })
})

describe('SessionService update', () => {
    beforeEach(() => {
        usersRepository.findById.mockResolvedValue(admin)
        sessionsRepository.findById.mockResolvedValue(session)
        sessionsRepository.updateSession.mockResolvedValue(session)
    })
    test('met à jour avec une date et un prof', async () => {
        teachersRepository.findById.mockResolvedValue(teacher)

        await sessionService.update(1, 1, {date: '2026-04-01', teacherId: 1})

        expect(teachersRepository.findById).toHaveBeenCalledWith(1)
        expect(sessionsRepository.updateSession).toHaveBeenCalledWith(1, {date: new Date('2026-04-01'), teacherId: 1})
    })
    test('met à jour sans date ni prof', async () => {
        await sessionService.update(1, 1, {name: 'Nouveau nom'})

        expect(teachersRepository.findById).not.toHaveBeenCalled()
        expect(sessionsRepository.updateSession).toHaveBeenCalledWith(1, {name: 'Nouveau nom', date: undefined})
    })
    test('un user non admin peut pas modifier', async () => {
        usersRepository.findById.mockResolvedValue(simpleUser)
        await expect(sessionService.update(2, 1, {name: 'x'})).rejects.toThrow(ForbiddenError)
    })
    test('throw si le nouveau prof existe pas', async () => {
        teachersRepository.findById.mockResolvedValue(null)
        await expect(sessionService.update(1, 1, {teacherId: 99})).rejects.toThrow(TeacherNotFoundError)
        expect(sessionsRepository.updateSession).not.toHaveBeenCalled()
    })
})

describe('SessionService delete', () => {
    test('un admin peut supprimer', async () => {
        usersRepository.findById.mockResolvedValue(admin)
        sessionsRepository.findById.mockResolvedValue(session)
        await sessionService.delete(1, 1)
        expect(sessionsRepository.deleteSession).toHaveBeenCalledWith(1)
    })
    test('un user non admin peut pas supprimer', async () => {
        usersRepository.findById.mockResolvedValue(simpleUser)
        await expect(sessionService.delete(2, 1)).rejects.toThrow(ForbiddenError)
        expect(sessionsRepository.deleteSession).not.toHaveBeenCalled()
    })
})

describe('SessionService participate', () => {
    test('ajoute la participation', async () => {
        sessionsRepository.findById.mockResolvedValue(session)
        usersRepository.findById.mockResolvedValue(simpleUser)
        sessionsRepository.findParticipation.mockResolvedValue(null)

        await sessionService.participate(1, 2)

        expect(sessionsRepository.createParticipation).toHaveBeenCalledWith(1, 2)
    })
    test('throw si la session existe pas', async () => {
        sessionsRepository.findById.mockResolvedValue(null)
        await expect(sessionService.participate(99, 2)).rejects.toThrow(SessionNotFoundError)
    })
    test('throw si le user existe pas', async () => {
        sessionsRepository.findById.mockResolvedValue(session)
        usersRepository.findById.mockResolvedValue(null)
        await expect(sessionService.participate(1, 99)).rejects.toThrow(UserNotFoundError)
    })
    test('throw si le user participe déjà', async () => {
        sessionsRepository.findById.mockResolvedValue(session)
        usersRepository.findById.mockResolvedValue(simpleUser)
        sessionsRepository.findParticipation.mockResolvedValue({sessionId: 1, userId: 2})

        await expect(sessionService.participate(1, 2)).rejects.toThrow(AlreadyParticipatingError)
        expect(sessionsRepository.createParticipation).not.toHaveBeenCalled()
    })
})

describe('SessionService unparticipate', () => {
    test('supprime la participation', async () => {
        sessionsRepository.findParticipation.mockResolvedValue({sessionId: 1, userId: 2})
        await sessionService.unparticipate(1, 2)
        expect(sessionsRepository.deleteParticipation).toHaveBeenCalledWith(1, 2)
    })
    test('throw si le user participe pas', async () => {
        sessionsRepository.findParticipation.mockResolvedValue(null)
        await expect(sessionService.unparticipate(1, 2)).rejects.toThrow(ParticipationNotFoundError)
        expect(sessionsRepository.deleteParticipation).not.toHaveBeenCalled()
    })
})
