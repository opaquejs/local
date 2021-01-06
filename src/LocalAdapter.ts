import { v4 } from "uuid"
import { OpaqueModel, IdType, RootQuery, AdapterContract, OpaqueRow, SyncAdapterContract } from "@opaquejs/opaque"
import { queryCollection } from "./backend"

export class LocalOpaqueAdapter<Model extends typeof OpaqueModel> implements AdapterContract, SyncAdapterContract {
    storage: Map<IdType, OpaqueRow> = new Map()

    constructor(public model: Model) {
    }

    async create(data: OpaqueRow) {
        return this.createSync(data)
    }
    async update(query: RootQuery<OpaqueRow>, data: OpaqueRow) {
        return this.updateSync(query, data)
    }
    async read(query: RootQuery<OpaqueRow>) {
        return this.readSync(query)
    }
    async delete(query: RootQuery<OpaqueRow>) {
        return this.deleteSync(query)
    }

    deleteSync(query: RootQuery<OpaqueRow>) {
        for (const { [this.model.primaryKey as keyof OpaqueRow]: id } of queryCollection([...this.storage.values()], query)) {
            this.storage.delete(id as IdType)
        }
    }

    createSync(data: OpaqueRow) {
        const obj = { ...data } as any
        if (obj[this.model.primaryKey] === undefined) {
            obj[this.model.primaryKey] = v4()
        }
        this.storage.set(obj[this.model.primaryKey], obj)
        return this.storage.get(obj[this.model.primaryKey])!
    }

    updateSync(query: RootQuery<OpaqueRow>, data: OpaqueRow) {
        const result: OpaqueRow[] = []
        for (const { [this.model.primaryKey as keyof OpaqueRow]: id } of this.readSync(query)) {
            const previous = this.storage.get(id as IdType)!
            result.push(previous)
            for (const key in data) {
                previous[key] = data[key]
            }
        }
        return result
    }

    readSync(query: RootQuery<OpaqueRow>) {
        return queryCollection([...this.storage.values()], query)
    }
}