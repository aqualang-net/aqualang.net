import prisma, { getConlang } from "$lib/api/db";
import getError from "$lib/api/error";
import type { Request } from "@sveltejs/kit";
import type { components } from "$lib/api/generated/schema";

type APIConlang = components["schemas"]["Conlang"];
type APIHint = components["schemas"]["Hint"];
type APIComponent = NonNullable<APIHint["components"]>[number];

function getLookup(sentence: string, span: APIComponent): string {
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

    const map: { [key: string]: APIComponent; } = {};

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

async function getAllHints(id: string, fromConlang: boolean | undefined) {
    const c = await getConlang(id);
    if (c === null)
        return null;

    const hints = await prisma.hint.findMany({
        where: {
            fromConlang: fromConlang,
            conlangId: c.id
        }
    });
    const output: APIHint[] = [];

    for (let hint of hints) {
        const components = await getHintComponents(hint.id);
        output.push({
            id: hint.id,
            key: hint.key,
            hints: hint.hints.split('\n'),
            components: components,
            from: hint.fromConlang ? "conlang" : "natlang"
        });
    }

    return output;
}

async function getRecursiveHints(id: string, fromConlang: boolean, key: string) {
    const c = await getConlang(id);
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
    const output: APIHint[] = [];

    for (let i = 0; i < hints.length; i++) {
        const components = await getHintComponents(hints[i].id);
        output.push({
            id: hints[i].id,
            key: hints[i].key,
            hints: hints[i].hints.split('\n'),
            components: components,
            from: hint.fromConlang ? "conlang" : "natlang"
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

export async function get(req: Request) {
    let fromConlang: boolean | undefined = undefined;

    if (req.query.has("from")) {
        switch (req.query.get("from")) {
            case "conlang":
                fromConlang = true;
                break;
            case "natlang":
                fromConlang = false;
                break;
            default:
                if (await getConlang(req.params.id) === null) return getError("notfound");
                return {
                    status: 200,
                    body: []
                }
        }
    }

    const output = req.query.has("parent") && fromConlang !== undefined ?
        await getRecursiveHints(req.params.id, fromConlang, req.query.get("parent")) :
        await getAllHints(req.params.id, fromConlang);
    
    if (output === null) return getError("notfound");

    return {
        status: 200,
        body: output
    }
}
