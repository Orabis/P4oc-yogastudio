export class HttpError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
    }
}

export class InvalidCredentialsError extends HttpError {
    constructor() {
        super(401, 'Invalid credentials');
    }
}

export class UserAlreadyExistsErrors extends HttpError {
    constructor() {
        super(401, 'User already exists');
    }
}