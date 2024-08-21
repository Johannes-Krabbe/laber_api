import { prisma } from "../../prisma/client";

const users = await prisma.user.findMany()

for (const user of users) {
    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            username: user.username?.toLowerCase().replace(/[^a-z0-9]/g, '')
        }
    })
}
