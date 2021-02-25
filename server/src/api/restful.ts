import { Request, Response } from "express";

import path from "path";
import yaml from "js-yaml";
import fs from "fs";

type Errors = { [key: string]: { status_code: number, message: string } };

const errors = yaml.load(fs.readFileSync(path.resolve('../api/errors.yaml'), 'utf8')) as Errors;

export async function restful(req: Request, res: Response, handlers: { [key: string]: (req: Request, res: Response) => Promise<string | undefined> }) {
    const method = req.method.toLowerCase();

    let error_;
    if (!(method in handlers)) {
        error_ = "badmethod";
        res.set("Allow", Object.keys(handlers).join(", ").toUpperCase());
    } else {
        error_ = await handlers[method](req, res);
    }

    if (!error_) {
        return;
    }

    error(res, error_);
}

export function error(res: Response, error: string) {
    const code = errors[error].status_code;
    const message = errors[error].message;

    res.status(code).send({
        error: error,
        message: message
    });
}
