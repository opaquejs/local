import { ComparisonTypes, Queryable, Query, RootQuery } from "@opaquejs/opaque";

export const matchesComparison = <Value, C extends ComparisonTypes<Value>, PC extends keyof C>(left: Value, comparison: PC, right: C[PC]) => {
    return (comparisonFunctions(left) as any)[comparison](right) as boolean
}

export const matchesComparisons = <Value>(left: Value, comparisons: Partial<ComparisonTypes<Value>>) => {
    for (const type in comparisons) {
        if (!matchesComparison(left, type as keyof typeof comparisons, comparisons[type as keyof Partial<ComparisonTypes<Value>>]!)) {
            return false;
        }
    }
    return true
}

export const matchesQuery = <T extends Queryable>(object: T, query: Query<T>) => {
    for (const key in query) {
        const value = object[key as keyof T]
        const comparisons = query[key]
        if (!comparisons) {
            continue
        }
        if (key == '$or' && Array.isArray(query['$or'])) {
            if (!query['$or'].map(subquery => matchesQuery(object, subquery)).includes(true)) {
                return false
            }
        } else if (!key.startsWith('$')) {
            if (!matchesComparisons(value, comparisons)) {
                return false
            }
        }
    }
    return true
}

export const queryCollection = <T extends Queryable>(collection: T[], query: RootQuery<T>): T[] => {
    collection = collection.filter(item => matchesQuery(item, query))
    if (query.$skip != undefined) {
        collection = collection.slice(Math.max(0, query.$skip))
    }
    if (query.$limit != undefined) {
        collection = collection.slice(0, Math.max(0, query.$limit))
    }
    return collection
}


export type ComparisonFunctions<Value> = {
    [P in keyof ComparisonTypes<Value>]: (right: ComparisonTypes<Value>[P]) => boolean
}

export const comparisonFunctions = <Value>(left: Value) => ({
    $eq: (right) => left == right,
    $gt: right => left > right,
    $gte: right => left >= right,
    $lt: right => left < right,
    $lte: right => left <= right,
    $ne: right => left != right,
    $in: right => right.includes(left),
} as ComparisonFunctions<Value>)