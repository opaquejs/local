import { matchesQuery, queryCollection } from "../backend"
import { Query } from "@opaquejs/opaque"

describe('matchesQuery', () => {
    test('_eq', () => {
        expect(matchesQuery({ lel: 'hallo' }, { lel: { _eq: 'hallo' } })).toBe(true)
        expect(matchesQuery({ lel: 1 }, { lel: { _eq: '1' } } as any)).toBe(true)
        expect(matchesQuery({ lel: '1' }, { lel: { _eq: 1 } } as any)).toBe(true)
        expect(matchesQuery({ lel: '' }, { lel: { _eq: false } } as any)).toBe(true)
        expect(matchesQuery({ lel: '0' }, { lel: { _eq: false } } as any)).toBe(true)
        expect(matchesQuery({ lel: 0 }, { lel: { _eq: false } } as any)).toBe(true)

        expect(matchesQuery({ lel: 'hallo' }, { lel: { _eq: 'hall' } })).toBe(false)
        expect(matchesQuery({ lele: 'hallo' }, { lel: { _eq: 'hallo' } } as any)).toBe(false)
        expect(matchesQuery({ lel: 'hallo' }, { lele: { _eq: 'hallo' } } as any)).toBe(false)
        expect(matchesQuery({ lel: 1 }, { lele: { _eq: '2' } } as any)).toBe(false)
        expect(matchesQuery({ lel: false }, { lele: { _eq: '2' } } as any)).toBe(false)
    })
    test('_ne', () => {
        expect(matchesQuery({ lel: 'hallo' }, { lel: { _ne: 'hallo' } })).toBe(false)
        expect(matchesQuery({ lel: 1 }, { lel: { _ne: '1' } } as any)).toBe(false)
        expect(matchesQuery({ lel: '1' }, { lel: { _ne: 1 } } as any)).toBe(false)
        expect(matchesQuery({ lel: '' }, { lel: { _ne: false } } as any)).toBe(false)
        expect(matchesQuery({ lel: '0' }, { lel: { _ne: false } } as any)).toBe(false)
        expect(matchesQuery({ lel: 0 }, { lel: { _ne: false } } as any)).toBe(false)

        expect(matchesQuery({ lel: 'hallo' }, { lel: { _ne: 'hall' } })).toBe(true)
        expect(matchesQuery({ lele: 'hallo' }, { lel: { _ne: 'hallo' } } as any)).toBe(true)
        expect(matchesQuery({ lel: 'hallo' }, { lele: { _ne: 'hallo' } } as any)).toBe(true)
        expect(matchesQuery({ lel: 1 }, { lele: { _ne: '2' } } as any)).toBe(true)
        expect(matchesQuery({ lel: false }, { lele: { _ne: '2' } } as any)).toBe(true)
    })
    test('_gt', () => {
        expect(matchesQuery({ lel: 3 }, { lel: { _gt: 2 } })).toBe(true)
        expect(matchesQuery({ lel: 3 }, { lel: { _gt: 3 } })).toBe(false)
        expect(matchesQuery({ lel: 3 }, { lel: { _gt: 4 } })).toBe(false)
    })
    test('_gte', () => {
        expect(matchesQuery({ lel: 3 }, { lel: { _gte: 2 } })).toBe(true)
        expect(matchesQuery({ lel: 3 }, { lel: { _gte: 3 } })).toBe(true)
        expect(matchesQuery({ lel: 3 }, { lel: { _gte: 4 } })).toBe(false)
    })
    test('_lt', () => {
        expect(matchesQuery({ lel: 3 }, { lel: { _lt: 2 } })).toBe(false)
        expect(matchesQuery({ lel: 3 }, { lel: { _lt: 3 } })).toBe(false)
        expect(matchesQuery({ lel: 3 }, { lel: { _lt: 4 } })).toBe(true)
    })
    test('_lte', () => {
        expect(matchesQuery({ lel: 3 }, { lel: { _lte: 2 } })).toBe(false)
        expect(matchesQuery({ lel: 3 }, { lel: { _lte: 3 } })).toBe(true)
        expect(matchesQuery({ lel: 3 }, { lel: { _lte: 4 } })).toBe(true)
    })
    test('_or', () => {
        const query: Query<{
            lel: string,
            lol: boolean,
            xd: number
        }> = {
            _or: [
                { lel: { _eq: 'hallo' } },
                { lel: { _eq: 'hallo2' } },
                { lel: { _eq: 'hallo3' }, lol: { _eq: true } },
                {
                    lel: { _eq: 'hallo4' }, _or: [
                        { xd: { _eq: 2 } },
                        { xd: { _eq: 3 } },
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
    test('_limit and _skip', () => {
        expect(queryCollection(collection, { _limit: 1 })).toHaveLength(1)
        expect(queryCollection(collection, { _limit: 2, _skip: 2 })).toHaveLength(1)
        expect(queryCollection(collection, { _skip: 2 })).toHaveLength(1)
        expect(queryCollection(collection, { _skip: 1 })).toHaveLength(2)
        expect(queryCollection(collection, { _skip: 5 })).toHaveLength(0)
        expect(queryCollection(collection, { _limit: 0 })).toHaveLength(0)
        expect(queryCollection(collection, { _limit: -1 })).toHaveLength(0)
        expect(queryCollection(collection, { _limit: Infinity })).toHaveLength(3)
        expect(queryCollection(collection, { _skip: Infinity })).toHaveLength(0)
    })
    test('comparisons', () => {
        expect(queryCollection(collection, { lel: { _eq: 'hallo1' } })).toHaveLength(1)
        expect(queryCollection(collection, { lel: { _eq: 'hallo2' } })).toHaveLength(1)
        expect(queryCollection(collection, { lel: { _eq: 'hallo3' } })).toHaveLength(1)
        expect(queryCollection(collection, { lel: { _ne: 'hallo3' } })).toHaveLength(2)
    })
})