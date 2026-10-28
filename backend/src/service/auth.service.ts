import * as bcrypt from "bcrypt";
import {generateToken} from "../utils/jwt.util";
import {UsersRepository} from "../repository/users.repository";
import {InvalidCredentialsError, UserAlreadyExistsError} from "../utils/HttpErrorHandler.util";
import {RegisterData} from "../types";

export class AuthService {
    constructor(private usersRepository: UsersRepository) {}
    async loginUser(email: string, password: string) {
        const user = await this.usersRepository.findByEmail(email);
        if (!user) throw new InvalidCredentialsError
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new InvalidCredentialsError

        const token = generateToken(user.id);
            return {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                admin: user.admin,
                token,
            }
    }

    async registerUser(email: string, password: string, firstName: string, lastName: string){
        const existingUser = await this.usersRepository.findByEmail(email);
        if (existingUser) throw new UserAlreadyExistsError
        const hashedPassword = await bcrypt.hash(password, 10);
        const data: RegisterData = {
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName,
            admin: false,
        }
        const user = await this.usersRepository.createNewUser(data)
        const token = generateToken(user.id);

        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            admin: user.admin,
            token,
        };
    }
}
