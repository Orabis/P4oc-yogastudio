import {beforeEach, describe, expect, test, vi} from 'vitest'
import {TeacherService} from "../../src/service/teacher.service";
import {TeachersRepository} from "../../src/repository/teachers.repository";
import {TeacherNotFoundError} from "../../src/utils/HttpErrorHandler.util";

const teacher = {
    id: 1,
    firstName: 'Margot',
    lastName: 'Delahaye',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
}

const teachersRepository = {
    findMany: vi.fn(),
    findById: vi.fn(),
}
const teacherService = new TeacherService(teachersRepository as unknown as TeachersRepository)

beforeEach(() => {
    vi.resetAllMocks()
})

describe('TeacherService', () => {
    test('getAll retourne la liste des profs', async () => {
        teachersRepository.findMany.mockResolvedValue([teacher, {...teacher, id: 2}])

        const teachers = await teacherService.getAll()

        expect(teachers).toHaveLength(2)
        expect(teachers[0]).toEqual(teacher)
    })
    test('getById retourne le prof', async () => {
        teachersRepository.findById.mockResolvedValue(teacher)

        expect(await teacherService.getById(1)).toEqual(teacher)
        expect(teachersRepository.findById).toHaveBeenCalledWith(1)
    })
    test('getById throw si le prof existe pas', async () => {
        teachersRepository.findById.mockResolvedValue(null)
        await expect(teacherService.getById(99)).rejects.toThrow(TeacherNotFoundError)
    })
})
