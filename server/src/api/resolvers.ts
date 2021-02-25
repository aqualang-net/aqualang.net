import { Express, Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client"
import { error, restful } from "./restful";
import { components } from "./generated/schema";

const prisma = new PrismaClient();

type Conlang = components["schemas"]["Conlang"];
type Hint = components["schemas"]["Hint"];
type Component = NonNullable<Hint["components"]>[number];

function getLookup(sentence: string, span: Component): string {
    let lookup = '';

    for (let section of span) {
        if (section.start < 0 || section.end > sentence.length) {
        }

        if (section.suffix) {
            lookup += '\ns';
        }
        let s = sentence.substr(section.start, section.end - section.start);
        if (section.prefix) {
            lookup += '\np';
        }

        lookup += s + '\nd';
    }
    lookup = lookup.substr(0, lookup.length - 2);

    return lookup;
}

function getHint(conlang: number, fromConlang: boolean, key: string) {
    return prisma.hint.findUnique({
        where: {
            conlangId_fromConlang_key: {
                conlangId: conlang,
                fromConlang: fromConlang,
                key: key
            }
        }
    });
}

async function getHintComponents(hint: number) {
    const sections = await prisma.section.findMany({
        where: {
            hintId: hint
        }
    });

    const map: { [key: string]: Component; } = {};

    for (const section of sections) {
        if (!map[section.areaStart])
            map[section.areaStart] = [];

        map[section.areaStart].push({
            prefix: section.prefix,
            suffix: section.suffix,
            start: section.start,
            end: section.end
        });
    }

    return Object.values(map);
}

function removeHintArea(hint: number, start: number) {
    return prisma.section.deleteMany({
        where: {
            hintId: hint,
            areaStart: start
        }
    });
}

async function getHints(hintId: number) {
    const hint = await prisma.hint.findUnique({
        where: {
            id: hintId
        },
        select: {
            hints: true
        }
    });

    if (hint === null)
        return null;

    return hint.hints.split('\n');
}

async function setHints(hintId: number, hints: string[]) {
    const hint = await prisma.hint.update({
        where: {
            id: hintId
        },
        data: {
            hints: hints.join('\n')
        },
        select: {
            hints: true
        }
    });
    return hint.hints.split('\n');
}

async function addHint(hintId: number, string: string) {
    // Get hint
    const hints = await getHints(hintId);
    if (hints === null)
        return null;

    // Add hint
    hints.push(string);
    return setHints(hintId, hints);
}

async function setHint(hintId: number, index: number, string: string) {
    // Get hint
    const hints = await getHints(hintId);
    if (hints === null || index >= hints.length)
        return hints;

    // Set index
    hints[index] = string;
    return setHints(hintId, hints);
}

async function removeHint(hintId: number, index: number) {
    // Get hint
    const hints = await getHints(hintId);
    if (hints === null || index >= hints.length)
        return hints;

    if (hints.length <= 1) {
        // If that was the last hint, delete the entire hint!
        await removeEntireHint(hintId);
        return [];
    } else {
        // Delete specific hint
        hints.splice(index, 1);
        return setHints(hintId, hints);
    }
}

async function removeEntireHint(hintId: number) {
    // Doing this raw because cascading isn't supported yet
    await prisma.$executeRaw`DELETE FROM Hint WHERE id = ${hintId};`;
    return true;
}

async function getPrismaConlang(id: string) {
    for (let char of id)
        if (char < '0' || char > '9')
            return null;

    const num = parseInt(id);
    return await prisma.conlang.findUnique({
        where: {
            id: num
        }
    });
}

async function getAllHints(id: string, fromConlang: boolean) {
    const c = await getPrismaConlang(id);
    if (c === null)
        return null;

    const hints = await prisma.hint.findMany({
        where: {
            fromConlang: fromConlang,
            conlangId: c.id
        }
    });
    const output: Hint[] = [];

    for (let hint of hints) {
        const components = await getHintComponents(hint.id);
        output.push({
            id: hint.id,
            key: hint.key,
            hints: hint.hints.split('\n'),
            components: components,
            natlang: !hint.fromConlang
        });
    }

    return output;
}

async function getRecursiveHints(id: string, fromConlang: boolean, key: string) {
    const c = await getPrismaConlang(id);
    if (c === null)
        return null;

    // Get first hint
    const hint = await getHint(c.id, fromConlang, key);
    if (hint === null) {
        return [];
    }

    const processed = new Set();
    processed.add(key);

    // Get subsequent hints
    const hints = [hint];
    const output: Hint[] = [];

    for (let i = 0; i < hints.length; i++) {
        const components = await getHintComponents(hints[i].id);
        output.push({
            id: hints[i].id,
            key: hints[i].key,
            hints: hints[i].hints.split('\n'),
            components: components,
            natlang: !hint.fromConlang
        });

        for (const area of components) {
            // Get lookup key
            const lookup = getLookup(hints[i].key, area);
            if (processed.has(lookup)) continue;
            processed.add(lookup);

            // Get hint
            const subHint = await getHint(c.id, hints[i].fromConlang, lookup);
            if (subHint === null) continue;
            hints.push(subHint);
        }
    }

    return output;
}

export function addResolvers(app: Express) {
    app.all('/api/conlangs', (req, res) => restful(req, res, {
        get: async (_req, res) => {
            const conlangs: Conlang[] = (await prisma.conlang.findMany()).map(c => {
                return {
                    id: c.id,
                    name: c.name,
                    published: false
                }
            });

            res.status(200).send(conlangs);
            return undefined;
        }
    }));

    app.all('/api/conlangs/:id', (req, res) => restful(req, res, {
        get: async (req, res) => {
            const c = await getPrismaConlang(req.params.id);
            if (c === null)
                return "notfound";

            const conlang: Conlang = {
                id: c.id,
                name: c.name,
                published: false
            };

            res.status(200).send(conlang);
            return undefined;
        }
    }));

    app.all('/api/conlangs/:id/hints/natlang', (req, res) => restful(req, res, {
        get: async (req, res) => {
            const output = req.query.from ?
                await getRecursiveHints(req.params.id, false, req.query.from.toString()) :
                await getAllHints(req.params.id, false);

            if (output === null)
                return "notfound";

            res.status(200).send(output);
            return undefined;
        }
    }));

    app.all('/api/conlangs/:id/hints/conlang', (req, res) => restful(req, res, {
        get: async (req, res) => {
            const output = req.query.from ?
                await getRecursiveHints(req.params.id, true, req.query.from.toString()) :
                await getAllHints(req.params.id, true);

            if (output === null)
                return "notfound";

            res.status(200).send(output);
            return undefined;
        }
    }));

    // 404 not found
    app.all('/api', (_req, res) => error(res, "notfound"));
    app.all('/api/*', (_req, res) => error(res, "notfound"));
}
