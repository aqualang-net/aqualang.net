import { getConlang } from "$lib/api/db";
import getError from "$lib/api/error";
import type { Request } from "@sveltejs/kit";

export async function get(req: Request) {
    const c = await getConlang(req.params.id);
    if (c === null) return getError("notfound");

    const conlang = {
        id: c.id,
        name: c.name,
        published: false
    };

    return {
        status: 200,
        body: conlang
    }
}
