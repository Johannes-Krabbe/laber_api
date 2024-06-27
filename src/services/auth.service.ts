import { User } from "@prisma/client";
import { FunctionReturnType } from "../types/function.type";
import { prisma } from "../../prisma/client";
import { hashPassword, verifyPassword } from "../utils/password.util";

export async function registerUser(data: { username: string, password: string }): Promise<FunctionReturnType<User, 400 | 201>> {
    if (await prisma.user.findUnique({
        where: {
            username: data.username
        }
    })
    ) {
        return {
            message: 'Username already exists',
            status: 400,
        }

    }

    const hashedPassword = await hashPassword(data.password)

    const user = await prisma.user.create({
        data: {
            username: data.username,
            password: hashedPassword,
        }
    })

    return {
        message: 'User created',
        status: 201,
        data: user
    }
}

export async function loginUser(data: { username: string, password: string }): Promise<FunctionReturnType<User, 400 | 200>> {
    const user = await prisma.user.findUnique({
        where: {
            username: data.username
        }
    })

    if (!user) {
        return {
            message: 'User not found',
            status: 400
        }
    }

    if (!(await verifyPassword(data.password, user.password))) {
        return {
            message: 'Password incorrect',
            status: 400
        }
    }

    return {
        data: user,
        message: 'Logged in',
        status: 200
    }
}
