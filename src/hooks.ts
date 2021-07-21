import getError from "$lib/api/error";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ request, resolve }) => {
    const isHead = request.method.toLowerCase() === "head";

    if (isHead) {
        request.method = "GET"
    }

    const response = await resolve(request);

    if (response.status === 404 && request.path.startsWith("/api")) {
        const error = getError("notfound");
        const string = JSON.stringify(error.body);
        return { status: 404, body: string, headers: { 'content-type': 'application/json; charset=utf-8' } };
    }

    if (isHead) {
        delete response.body;
    }

    return response;
}
