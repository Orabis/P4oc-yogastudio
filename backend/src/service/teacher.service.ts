import {Teacher} from "@prisma/client";
import {TeachersRepository} from "../repository/teachers.repository";
import {TeacherNotFoundError} from "../utils/HttpErrorHandler.util";

const toTeacherResponse = (teacher: Teacher) => ({
    id: teacher.id,
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    createdAt: teacher.createdAt,
    updatedAt: teacher.updatedAt,
});

export class TeacherService {
    constructor(private teachersRepository: TeachersRepository) {}

    async getAll() {
        const teachers = await this.teachersRepository.findMany();
        return teachers.map(toTeacherResponse);
    }

    async getById(id: number) {
        const teacher = await this.teachersRepository.findById(id);
        if (!teacher) throw new TeacherNotFoundError;
        return toTeacherResponse(teacher);
    }
}
