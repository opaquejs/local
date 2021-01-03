import { v4 } from "uuid"
import { OpaqueModel, ModelAttributes, IdType, RootQuery, Constructor, AdapterContract } from "@opaquejs/opaque"
import { queryCollection } from "./backend"

export class LocalOpaqueAdapter<Model extends typeof OpaqueModel> implements AdapterContract {
    storage: Map<IdType, ModelAttributes<InstanceType<Model>>> = new Map()

    constructor(public model: Model) {
    }

    async delete(query: RootQuery<ModelAttributes<InstanceType<Model>>>) {
        for (const { [this.model.primaryKey as keyof ModelAttributes<InstanceType<Model>>]: id } of queryCollection([...this.storage.values()], query)) {
            this.storage.delete(id as IdType)
        }
    }

    async create(data: ModelAttributes<InstanceType<Model>>) {
        const obj = { ...data } as any
        if (obj[this.model.primaryKey] === undefined) {
            obj[this.model.primaryKey] = v4()
        }
        this.storage.set(obj[this.model.primaryKey], obj)
        return obj
    }

    async update(query: RootQuery<ModelAttributes<InstanceType<Model>>>, data: ModelAttributes<InstanceType<Model>>) {
        const result: ModelAttributes<InstanceType<Model>>[] = []
        for (const { [this.model.primaryKey as keyof ModelAttributes<InstanceType<Model>>]: id } of await this.read(query)) {
            const previous = this.storage.get(id as IdType)!
            result.push(previous)
            for (const key in data) {
                (previous as any)[key] = (data as any)[key] as any
            }
        }
        return result
    }

    async read(query: RootQuery<ModelAttributes<InstanceType<Model>>>) {
        return queryCollection([...this.storage.values()], query)
    }
}

export const local = <T extends Constructor<OpaqueModel>>(base: T) => class RuntimeModel extends base {
    static $adapterConstructor = LocalOpaqueAdapter
}