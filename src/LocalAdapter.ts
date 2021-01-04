import { v4 } from "uuid"
import { OpaqueModel, ModelAttributes, IdType, RootQuery, Constructor, AdapterContract, OpaqueRow } from "@opaquejs/opaque"
import { queryCollection } from "./backend"

export class LocalOpaqueAdapter<Model extends typeof OpaqueModel> implements AdapterContract {
    storage: Map<IdType, OpaqueRow> = new Map()

    constructor(public model: Model) {
    }

    async delete(query: RootQuery<OpaqueRow>) {
        for (const { [this.model.primaryKey as keyof OpaqueRow]: id } of queryCollection([...this.storage.values()], query)) {
            this.storage.delete(id as IdType)
        }
    }

    async create(data: OpaqueRow) {
        const obj = { ...data } as any
        if (obj[this.model.primaryKey] === undefined) {
            obj[this.model.primaryKey] = v4()
        }
        this.storage.set(obj[this.model.primaryKey], obj)
        return this.storage.get(obj[this.model.primaryKey])!
    }

    async update(query: RootQuery<OpaqueRow>, data: OpaqueRow) {
        const result: OpaqueRow[] = []
        for (const { [this.model.primaryKey as keyof OpaqueRow]: id } of await this.read(query)) {
            const previous = this.storage.get(id as IdType)!
            result.push(previous)
            for (const key in data) {
                previous[key] = data[key]
            }
        }
        return result
    }

    async read(query: RootQuery<OpaqueRow>) {
        return queryCollection([...this.storage.values()], query)
    }
}