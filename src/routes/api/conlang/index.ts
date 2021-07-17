import prisma from "$lib/api/db";
import type { Request } from "@sveltejs/kit";

export async function get(req: Request) {
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
