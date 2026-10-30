import {SessionsRepository} from "../repository/sessions.repository";
import {TeachersRepository} from "../repository/teachers.repository";
import {UsersRepository} from "../repository/users.repository";
import {CreateSessionDto, UpdateSessionDto} from "../dto/session.dto";
import {
    AlreadyParticipatingError,
    ForbiddenError,
    ParticipationNotFoundError,
    SessionNotFoundError,
    TeacherNotFoundError,
    UserNotFoundError,
} from "../utils/HttpErrorHandler.util";

type SessionWithRelations = NonNullable<Awaited<ReturnType<SessionsRepository['findById']>>>;

const toSessionResponse = (session: SessionWithRelations) => ({
    id: session.id,
    name: session.name,
    date: session.date,
    description: session.description,
    teacher: {
        id: session.teacher.id,
        firstName: session.teacher.firstName,
        lastName: session.teacher.lastName,
    },
    users: session.participants.map((p) => p.user.id),
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
});

export class SessionService {
    constructor(
        private sessionsRepository: SessionsRepository,
        private teachersRepository: TeachersRepository,
        private usersRepository: UsersRepository,
    ) {}

    async getAll() {
        const sessions = await this.sessionsRepository.findMany();
        return sessions.map(toSessionResponse);
    }

    async getById(id: number) {
        const session = await this.sessionsRepository.findById(id);
        if (!session) throw new SessionNotFoundError;
        return toSessionResponse(session);
    }

    async create(userId: number, data: CreateSessionDto) {
        await this.assertAdmin(userId);
        await this.assertTeacherExists(data.teacherId);
        const session = await this.sessionsRepository.createSession({ ...data, date: new Date(data.date) });
        return toSessionResponse(session);
    }

    async update(userId: number, id: number, data: UpdateSessionDto) {
        await this.assertAdmin(userId);
        await this.assertSessionExists(id);
        if (data.teacherId) await this.assertTeacherExists(data.teacherId);
        const session = await this.sessionsRepository.updateSession(id, {
            ...data,
            date: data.date ? new Date(data.date) : undefined,
        });
        return toSessionResponse(session);
    }

    async delete(userId: number, id: number) {
        await this.assertAdmin(userId);
        await this.assertSessionExists(id);
        await this.sessionsRepository.deleteSession(id);
    }

    async participate(sessionId: number, userId: number) {
        await this.assertSessionExists(sessionId);
        const user = await this.usersRepository.findById(userId);
        if (!user) throw new UserNotFoundError;
        const participation = await this.sessionsRepository.findParticipation(sessionId, userId);
        if (participation) throw new AlreadyParticipatingError;
        await this.sessionsRepository.createParticipation(sessionId, userId);
    }

    async unparticipate(sessionId: number, userId: number) {
        const participation = await this.sessionsRepository.findParticipation(sessionId, userId);
        if (!participation) throw new ParticipationNotFoundError;
        await this.sessionsRepository.deleteParticipation(sessionId, userId);
    }

    private async assertAdmin(userId: number) {
        const user = await this.usersRepository.findById(userId);
        if (!user || !user.admin) throw new ForbiddenError('Admin access required');
    }

    private async assertSessionExists(id: number) {
        const session = await this.sessionsRepository.findById(id);
        if (!session) throw new SessionNotFoundError;
    }

    private async assertTeacherExists(id: number) {
        const teacher = await this.teachersRepository.findById(id);
        if (!teacher) throw new TeacherNotFoundError;
    }
}
