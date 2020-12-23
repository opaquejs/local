import { attribute, OpaqueModel } from '@opaquejs/opaque'
import { local } from '../LocalAdapter'


describe('LocalAdapter', () => {

    class Task extends local(OpaqueModel) {
        @attribute({ primaryKey: true })
        public id?: string = undefined

        @attribute()
        public title?: string
    }

    test('automatic id', async () => {

        const task = new Task()
        task.title = 'test'
        expect(task.id).toBeUndefined()
        expect(task.$isPersistent).toBe(false)

        await task.save()
        expect(task.id).not.toBe(null)
        expect(task.$isPersistent).toBe(true)

        const othertask = new Task()
        othertask.$setAndSave({ title: 'lel' })
        expect(othertask.id).not.toBe(task.id)

    })

    test('keeps given id on create', async () => {
        await Task.$adapter.create({ id: '12' })

        expect(await Task.$adapter.read({ id: { _eq: '12' } })).toHaveLength(1)
    })

})
