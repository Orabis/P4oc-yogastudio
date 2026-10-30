export class HttpError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = new.target.name;
    }
}
export class BadRequestError extends HttpError {
    constructor(message = 'Bad request') { super(400, message); }
}
export class UnauthorizedError extends HttpError {
    constructor(message = 'Unauthorized') { super(401, message); }
}
export class ForbiddenError extends HttpError {
    constructor(message = 'Forbidden') { super(403, message); }
}
export class NotFoundError extends HttpError {
    constructor(message = 'Not found') { super(404, message); }
}
export class ConflictError extends HttpError {
    constructor(message = 'Conflict') { super(409, message); }
}

export class InvalidCredentialsError extends UnauthorizedError {
    constructor() { super('Invalid credentials'); }
}
export class UserAlreadyExistsError extends ConflictError {
    constructor() { super('User already exists'); }
}
export class InvalidUserIdError extends BadRequestError {
    constructor() { super('Invalid user id'); }
}
export class UserNotFoundError extends NotFoundError {
    constructor() { super('User not found'); }
}
export class SessionNotFoundError extends NotFoundError {
    constructor() { super('Session not found'); }
}
export class TeacherNotFoundError extends NotFoundError {
    constructor() { super('Teacher not found'); }
}
export class ParticipationNotFoundError extends NotFoundError {
    constructor() { super('Participation not found'); }
}
export class AlreadyParticipatingError extends BadRequestError {
    constructor() { super('User already participating in this session'); }
}
