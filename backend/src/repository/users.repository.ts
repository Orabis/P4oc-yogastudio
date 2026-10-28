import {PrismaClient} from "@prisma/client";
import {RegisterData} from "../types";

export class UsersRepository {
    constructor(private prisma: PrismaClient) {
    }

    findById(id: number) {
        return this.prisma.user.findUnique({where: {id}});
    }

    findByEmail(email: string) {
        return this.prisma.user.findUnique({where: {email}});
    }

    createNewUser(data: RegisterData) {
        return this.prisma.user.create({ data })
    }
}
