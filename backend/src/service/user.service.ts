import {UsersRepository} from "../repository/users.repository";
import {UserNotFoundError} from "../utils/HttpErrorHandler.util";

export class UserService {
    constructor(private usersRepository: UsersRepository) {}
    async getUserId(id: number) {
        const user = await this.usersRepository.findById(id);
        if (!user) throw new UserNotFoundError;

        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            admin: user.admin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    async deleteUser(id: number) {
        const user = await this.usersRepository.findById(id);
        if (!user) throw new UserNotFoundError;
        await this.usersRepository.deleteUser(id)
    }

    async updateToAdmin(id: number){
        const user = await this.usersRepository.findById(id);
        if (!user) throw new UserNotFoundError;
        const updated = await this.usersRepository.updateUser(id, { admin: true});
        const { password, ...safeUser } = updated
        return safeUser;
    }
}