// TODO: Populate
const errors = {
    notfound: {
        status: 404,
        message: "Not Found"
    }
}

export default function getError(code: string) {
    return {
        status: errors[code].status,
        body: {
            "error": code,
            "message": errors[code].message
        }
    }
}
