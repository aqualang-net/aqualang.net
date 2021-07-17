import getError from "$lib/api/error";

function response() { return getError("notfound"); }

// Most HTTP request methods
export const get = response;
export const post = response;
export const put = response;
export const patch = response;
export const del = response;
export const options = response;
export const head = response;
