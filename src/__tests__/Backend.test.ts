import { matchesQuery, queryCollection } from "../backend"
import { Query } from "@opaquejs/opaque"

describe('matchesQuery', () => {
    test('$eq', () => {
        expect(matchesQuery({ lel: 'hallo' }, { lel: { $eq: 'hallo' } })).toBe(true)
        expect(matchesQuery({ lel: 1 }, { lel: { $eq: '1' } } as any)).toBe(true)
        expect(matchesQuery({ lel: '1' }, { lel: { $eq: 1 } } as any)).toBe(true)
        expect(matchesQuery({ lel: '' }, { lel: { $eq: false } } as any)).toBe(true)
        expect(matchesQuery({ lel: '0' }, { lel: { $eq: false } } as any)).toBe(true)
        expect(matchesQuery({ lel: 0 }, { lel: { $eq: false } } as any)).toBe(true)

        expect(matchesQuery({ lel: 'hallo' }, { lel: { $eq: 'hall' } })).toBe(false)
        expect(matchesQuery({ lele: 'hallo' }, { lel: { $eq: 'hallo' } } as any)).toBe(false)
        expect(matchesQuery({ lel: 'hallo' }, { lele: { $eq: 'hallo' } } as any)).toBe(false)
        expect(matchesQuery({ lel: 1 }, { lele: { $eq: '2' } } as any)).toBe(false)
        expect(matchesQuery({ lel: false }, { lele: { $eq: '2' } } as any)).toBe(false)
    })
    test('$ne', () => {
        expect(matchesQuery({ lel: 'hallo' }, { lel: { $ne: 'hallo' } })).toBe(false)
        expect(matchesQuery({ lel: 1 }, { lel: { $ne: '1' } } as any)).toBe(false)
        expect(matchesQuery({ lel: '1' }, { lel: { $ne: 1 } } as any)).toBe(false)
        expect(matchesQuery({ lel: '' }, { lel: { $ne: false } } as any)).toBe(false)
        expect(matchesQuery({ lel: '0' }, { lel: { $ne: false } } as any)).toBe(false)
        expect(matchesQuery({ lel: 0 }, { lel: { $ne: false } } as any)).toBe(false)

        expect(matchesQuery({ lel: 'hallo' }, { lel: { $ne: 'hall' } })).toBe(true)
        expect(matchesQuery({ lele: 'hallo' }, { lel: { $ne: 'hallo' } } as any)).toBe(true)
        expect(matchesQuery({ lel: 'hallo' }, { lele: { $ne: 'hallo' } } as any)).toBe(true)
        expect(matchesQuery({ lel: 1 }, { lele: { $ne: '2' } } as any)).toBe(true)
        expect(matchesQuery({ lel: false }, { lele: { $ne: '2' } } as any)).toBe(true)
    })
    test('$gt', () => {
        expect(matchesQuery({ lel: 3 }, { lel: { $gt: 2 } })).toBe(true)
        expect(matchesQuery({ lel: 3 }, { lel: { $gt: 3 } })).toBe(false)
        expect(matchesQuery({ lel: 3 }, { lel: { $gt: 4 } })).toBe(false)
    })
    test('$gte', () => {
        expect(matchesQuery({ lel: 3 }, { lel: { $gte: 2 } })).toBe(true)
        expect(matchesQuery({ lel: 3 }, { lel: { $gte: 3 } })).toBe(true)
        expect(matchesQuery({ lel: 3 }, { lel: { $gte: 4 } })).toBe(false)
    })
    test('$lt', () => {
        expect(matchesQuery({ lel: 3 }, { lel: { $lt: 2 } })).toBe(false)
        expect(matchesQuery({ lel: 3 }, { lel: { $lt: 3 } })).toBe(false)
        expect(matchesQuery({ lel: 3 }, { lel: { $lt: 4 } })).toBe(true)
    })
    test('$lte', () => {
        expect(matchesQuery({ lel: 3 }, { lel: { $lte: 2 } })).toBe(false)
        expect(matchesQuery({ lel: 3 }, { lel: { $lte: 3 } })).toBe(true)
        expect(matchesQuery({ lel: 3 }, { lel: { $lte: 4 } })).toBe(true)
    })
    test('$or', () => {
        const query: Query<{
            lel: string,
            lol: boolean,
            xd: number
        }> = {
            $or: [
                { lel: { $eq: 'hallo' } },
                { lel: { $eq: 'hallo2' } },
                { lel: { $eq: 'hallo3' }, lol: { $eq: true } },
                {
                    lel: { $eq: 'hallo4' }, $or: [
                        { xd: { $eq: 2 } },
                        { xd: { $eq: 3 } },
                    ]
                },
            ]
        }
        expect(matchesQuery({ lel: 'hallo' }, query)).toBe(true)
        expect(matchesQuery({ lel: 'hallo2' }, query)).toBe(true)
        expect(matchesQuery({ lel: 'hallo1' }, query)).toBe(false)
        expect(matchesQuery({ lel: 'hallo3' }, query)).toBe(false)
        expect(matchesQuery({ lel: 'hallo3', lol: true }, query)).toBe(true)
        expect(matchesQuery({ lel: 'hallo4', xd: 1 }, query)).toBe(false)
        expect(matchesQuery({ lel: 'hallo4', xd: 2 }, query)).toBe(true)
        expect(matchesQuery({ lel: 'hallo4', xd: 3 }, query)).toBe(true)
    })
})

describe('queryCollection', () => {
    const collection = [{ lel: 'hallo1' }, { lel: 'hallo2' }, { lel: 'hallo3' }]
    test('$limit and $skip', () => {
        expect(queryCollection(collection, { $limit: 1 })).toHaveLength(1)
        expect(queryCollection(collection, { $limit: 2, $skip: 2 })).toHaveLength(1)
        expect(queryCollection(collection, { $skip: 2 })).toHaveLength(1)
        expect(queryCollection(collection, { $skip: 1 })).toHaveLength(2)
        expect(queryCollection(collection, { $skip: 5 })).toHaveLength(0)
        expect(queryCollection(collection, { $limit: 0 })).toHaveLength(0)
        expect(queryCollection(collection, { $limit: -1 })).toHaveLength(0)
        expect(queryCollection(collection, { $limit: Infinity })).toHaveLength(3)
        expect(queryCollection(collection, { $skip: Infinity })).toHaveLength(0)
    })
    test('comparisons', () => {
        expect(queryCollection(collection, { lel: { $eq: 'hallo1' } })).toHaveLength(1)
        expect(queryCollection(collection, { lel: { $eq: 'hallo2' } })).toHaveLength(1)
        expect(queryCollection(collection, { lel: { $eq: 'hallo3' } })).toHaveLength(1)
        expect(queryCollection(collection, { lel: { $ne: 'hallo3' } })).toHaveLength(2)
    })
})