import { Model } from '@opaquejs/opaque'

export abstract class LocalModel extends Model {
    static last_id = 0
  
    async save() {
      if(!this.$persistent) {
        this.id = (this.constructor as typeof LocalModel).last_id++
      }
      await super.save()
    }
  }