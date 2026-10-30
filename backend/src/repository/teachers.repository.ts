import {PrismaClient} from "@prisma/client";

export class TeachersRepository {
    constructor(private prisma: PrismaClient) {}

    findMany() {
        return this.prisma.teacher.findMany({ orderBy: { createdAt: 'desc' } });
    }

    findById(id: number) {
        return this.prisma.teacher.findUnique({ where: { id } });
    }
}
