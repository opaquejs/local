import { LocalModel } from '../index'
import { attribute } from '@opaquejs/opaque'


describe('LocalModel', () => {
    
    class Task extends LocalModel {
        @attribute()
        public title: string | null = null
    }

    test('automatic id', async () => {

        const task = new Task()
        task.title = 'test'
        expect(task.id).toBe(null)
        expect(task.$persistent).toBe(false)
        
        await task.save()
        expect(task.id).not.toBe(null)
        expect(task.$persistent).toBe(true)

        const othertask = await Task.create({ title: 'lel' })
        expect(othertask.id).not.toBe(task.id)

    })

})
