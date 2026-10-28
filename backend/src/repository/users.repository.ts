import {Prisma, PrismaClient} from "@prisma/client";

export class UsersRepository {
    constructor(private prisma: PrismaClient) {
    }

    findById(id: number) {
        return this.prisma.user.findUnique({where: { id }});
    }

    findByEmail(email: string) {
        return this.prisma.user.findUnique({where: { email }});
    }

    createNewUser(data: Prisma.UserCreateInput) {
        return this.prisma.user.create({ data })
    }

    deleteUser(id: number) {
        return this.prisma.user.delete({where: { id: id }});
    }

    updateUser(id: number, data: Prisma.UserUpdateInput) {
        return this.prisma.user.update({
            where: {id: id},
            data,
        });
    }
}
