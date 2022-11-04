import {McoService} from '@mco/core'
import {action, makeObservable, observable} from 'mobx'

export interface ActItemInfo {
  id: number
  url: string
  priority?: number
  info?: string
}

function less(lhs: ActItemInfo, rhs: ActItemInfo) {
  return (rhs.priority || 0) - (lhs.priority || 0)
}

class ActService extends McoService {
  constructor() {
    super('ActService')

    this.registerInvoke('getItemInfo', this.getItemInfo)

    makeObservable(this)
  }

  @observable
  itemList: ActItemInfo[] = []

  // Invokes
  getItemInfo(id: number) {
    return this.itemList?.find(el => el.id === id)
  }

  // Opetators
  @action
  insterItems(items: ActItemInfo[]) {
    if (items.length <= 0) return

    for (let i = 0, l = items.length; i < l; i++) {
      const item = items[i]
      const index = this.itemList.findIndex(el => el.id === item.id)
      if (index === -1) {
        this.itemList.push(item)
      } else {
        this.itemList[index] = item
      }
    }

    this.itemList = this.itemList.sort(less).slice()

    items.forEach(el => this.emitSignal(`actifo${el.id}`, el.info))
  }

  @action
  removeItems(ids: number[]) {
    const l = this.itemList.length
    const newItemList: ActItemInfo[] = []

    for (let i = 0; i < l; i++) {
      const item = this.itemList[i]
      if (ids.includes(item.id)) continue
      newItemList.push(item)
    }

    this.itemList = newItemList
  }
}

const service = new ActService()

export default service
