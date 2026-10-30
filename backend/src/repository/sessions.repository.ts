import {Prisma, PrismaClient} from "@prisma/client";

const sessionInclude = { teacher: true, participants: { include: { user: true } } };

export class SessionsRepository {
    constructor(private prisma: PrismaClient) {}

    findMany() {
        return this.prisma.session.findMany({ include: sessionInclude });
    }

    findById(id: number) {
        return this.prisma.session.findUnique({ where: { id }, include: sessionInclude });
    }

    createSession(data: Prisma.SessionUncheckedCreateInput) {
        return this.prisma.session.create({ data, include: sessionInclude });
    }

    updateSession(id: number, data: Prisma.SessionUncheckedUpdateInput) {
        return this.prisma.session.update({ where: { id }, data, include: sessionInclude });
    }

    deleteSession(id: number) {
        return this.prisma.session.delete({ where: { id } });
    }

    findParticipation(sessionId: number, userId: number) {
        return this.prisma.sessionParticipation.findUnique({ where: { sessionId_userId: { sessionId, userId } } });
    }

    createParticipation(sessionId: number, userId: number) {
        return this.prisma.sessionParticipation.create({ data: { sessionId, userId } });
    }

    deleteParticipation(sessionId: number, userId: number) {
        return this.prisma.sessionParticipation.delete({ where: { sessionId_userId: { sessionId, userId } } });
    }
}
