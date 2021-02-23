import { UserInputError } from "apollo-server-express";
import { Resolvers, Section, Hint } from "./generated/graphql";
import { PrismaClient, Prisma } from "@prisma/client"

const prisma = new PrismaClient();

const data: any = {
    netherlandish: {
        prefix: '-',
        suffix: '-',
        separator: ' ... ',
        conlangHints: {
            "hij": {
                hints: ["he"]
            },
            "loop": {
                hints: ["walk", "am walking"]
            },
            "loopt": {
                hints: ["walks", "is walking"]
            },
            "lopen": {
                hints: ["walk", "are walking", "to walk"]
            },
        },
        englishHints: {
            "he": {
                hints: ["hij"]
            },
            "to walk": {
                hints: ["lopen"]
            },
            "walk": {
                hints: ["loop (1sg)", "loopt (2sg)", "lopen (pl)"]
            },
            "walks": {
                hints: ["loopt"]
            },
            "is walking": {
                spans: [
                    [{ start: 0, end: 2 }],
                    [{ start: 3, end: 10 }]
                ],
                hints: ["loopt"]
            },
            "is\ndwalking": {
                spans: [
                    [{ start: 0, end: 2 }],
                    [{ start: 4, end: 11 }]
                ],
                hints: ["loopt"]
            },
            "am walking": {
                spans: [
                    [{ start: 0, end: 2 }],
                    [{ start: 3, end: 10 }]
                ],
                hints: ["loop"]
            },
            "am\ndwalking": {
                spans: [
                    [{ start: 0, end: 2 }],
                    [{ start: 4, end: 11 }]
                ],
                hints: ["loop"]
            },
            "are walking": {
                spans: [
                    [{ start: 0, end: 3 }],
                    [{ start: 4, end: 11 }]
                ],
                hints: ["loopt (2sg)", "lopen (pl)"]
            },
            "are\ndwalking": {
                spans: [
                    [{ start: 0, end: 3 }],
                    [{ start: 5, end: 12 }]
                ],
                hints: ["loop (2sg)", "lopen (pl)"]
            },
            "is": {
                hints: ["is"]
            },
            "am": {
                hints: ["ben"]
            },
            "are": {
                hints: ["bent (2sg)", "zijn (pl)"]
            },
            "walking": {
                hints: ["lopend(e)"]
            }
        },
    }
}

function getLookup(sentence: string, span: Section[]): string {
    let lookup = '';

    for (let section of span) {
        if (section.start < 0 || section.end > sentence.length) {
            throw new UserInputError('Span section is bigger than the sentence provided');
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

async function getHintAreas(hint: number) {
    const sections = await prisma.section.findMany({
        where: {
            hintId: hint
        }
    });

    const map: { [key: string]: Section[]; } = {};

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

export const resolvers: Resolvers = {
    Query: {
        hint: async (_parent, args) => {
            const input = args.phrase;

            // Get lookup key
            const lookup = getLookup(input.sentence, input.area);

            // Get first hint
            const hint = await getHint(args.conlang, input.fromConlang, lookup);
            if (hint === null) {
                return [];
            }

            const processed = new Set();
            processed.add(lookup);

            // Get subsequent hints
            const hints = [hint];
            const output: Hint[] = [];

            for (let i = 0; i < hints.length; i++) {
                const areas = await getHintAreas(hints[i].id);
                output.push({
                    id: hints[i].id,
                    key: hints[i].key,
                    hints: hints[i].hints.split('\n'),
                    areas: areas
                });

                for (const area of areas) {
                    // Get lookup key
                    const lookup = getLookup(hints[i].key, area);
                    if (processed.has(lookup)) continue;
                    processed.add(lookup);

                    // Get hint
                    const subHint = await getHint(args.conlang, input.fromConlang, lookup);
                    if (subHint === null) continue;
                    hints.push(subHint);
                }
            }

            // Return results
            return output;
        },
        conlang: (_parent, args) => {
            return prisma.conlang.findUnique({
                where: {
                    id: args.id
                }
            });
        },
    },
    Mutation: {
        addNewHint: async (_parent, args) => {
            const lookup = getLookup(args.phrase.sentence, args.phrase.area);

            const hint = await prisma.hint.create({
                data: {
                    key: lookup,
                    hints: args.hint,
                    fromConlang: args.phrase.fromConlang,
                    conlangId: args.conlang
                }
            }).catch(e => {
                if (e instanceof Prisma.PrismaClientKnownRequestError) {
                    switch (e.code) {
                        case "P2002": // Unique constraint
                            throw new UserInputError(`Hint with key '${lookup}' already exists`);
                        case "P2003": // Foreign key constraint
                            throw new UserInputError(`Unknown conlang with id '${args.conlang}'`);
                    }
                }

                // Something happened we didn't expect!
                throw e;
            });

            return {
                id: hint.id,
                key: hint.key,
                areas: [],
                hints: hint.hints.split('\n')
            }
        },
        addHint: (_parent, args) => {
            return addHint(args.hint, args.string);
        },
        setHint: (_parent, args) => {
            return setHint(args.hint, args.index, args.string);
        },
        removeHint: (_parent, args) => {
            return removeHint(args.hint, args.index);
        },
        removeEntireHint: (_parent, args) => {
            return removeEntireHint(args.hint);
        }
    }
};
