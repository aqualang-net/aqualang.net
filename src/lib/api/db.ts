import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getConlang(id: string) {
    for (let char of id)
        if (char < '0' || char > '9')
            return null;

    const num = parseInt(id);
    if (isNaN(num))
        return null;

    return await prisma.conlang.findUnique({
        where: {
            id: num
        }
    });
}

export default prisma;
