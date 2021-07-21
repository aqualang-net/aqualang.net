import prisma from "$lib/api/db";

export async function get() {
    const conlangs = (await prisma.conlang.findMany()).map(c => {
        return {
            id: c.id,
            name: c.name,
            published: false
        }
    });

    return {
        status: 200,
        body: conlangs
    }
}
