import {Server} from "node:http";
import {AddressInfo} from "node:net";
import {PrismaClient} from "@prisma/client";
import * as bcrypt from "bcrypt";
import app from "../../src/app";
import {generateToken} from "../../src/utils/jwt.util";

export const prisma = new PrismaClient()

let server: Server
let baseUrl: string

export const startServer = () => new Promise<void>((resolve) => {
    // port 0 = un port libre au hasard
    server = app.listen(0, () => {
        baseUrl = `http://localhost:${(server.address() as AddressInfo).port}`
        resolve()
    })
})

export const stopServer = async () => {
    await new Promise((resolve) => server.close(resolve))
    await prisma.$disconnect()
}

type RequestOptions = { method?: string, token?: string, body?: unknown, headers?: Record<string, string> }

export const request = (path: string, {method = 'GET', token, body, headers}: RequestOptions = {}) =>
    fetch(baseUrl + path, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && {Authorization: `Bearer ${token}`}),
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    })

export const resetDb = () =>
    prisma.$executeRawUnsafe('TRUNCATE users, teachers, sessions, "PARTICIPATE" RESTART IDENTITY CASCADE')

export const createUser = async (email = 'user@test.com', admin = false) => {
    const user = await prisma.user.create({
        data: {
            email,
            firstName: 'John',
            lastName: 'Doe',
            password: await bcrypt.hash('test!1234', 4),
            admin,
        },
    })
    return {...user, token: generateToken(user.id)}
}

export const createTeacher = () =>
    prisma.teacher.create({data: {firstName: 'Margot', lastName: 'Delahaye'}})

export const createSession = (teacherId: number) =>
    prisma.session.create({
        data: {name: 'Yoga Vinyasa', date: new Date('2026-02-15'), description: 'Un cours dynamique', teacherId},
    })
