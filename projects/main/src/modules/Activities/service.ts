import {McoService} from '@mco/core'
import {action, makeObservable, observable} from 'mobx'

export interface ActItemInfo {
  actId: number
  url: string
  width: number
  height: number
  priority: number
}

function less(lhs: ActItemInfo, rhs: ActItemInfo) {
  return (rhs.priority || 0) - (lhs.priority || 0)
}

class ActService extends McoService {
  constructor() {
    super('ActService')

    this.registerInvoke('getItemInfo', this.getItemInfo)

    this.insterItems([{actId: 1, url: 'http://localhost:3001', width: 160, height: 224, priority: 0}])

    makeObservable(this)
  }

  @observable
  itemList: ActItemInfo[] = []

  @observable
  focuseId = 0

  pkInfos?: Record<number, string>

  // Invokes
  getItemInfo(actId: number) {
    return this.itemList?.find(el => el.actId === actId)
  }

  update(actId: number, pkInfo: string) {
    this.emitSignal(`${actId}ActInfoChanged`, pkInfo)
  }

  // Opetators
  @action
  insterItems(items: ActItemInfo[]) {
    if (items.length <= 0) return

    let topItem: ActItemInfo | undefined = undefined
    for (let i = 0, l = items.length; i < l; i++) {
      const item = items[i]
      const index = this.itemList.findIndex(el => el.actId === item.actId)
      if (index === -1) {
        this.itemList.push(item)
        if (!topItem || topItem.priority <= item.priority) {
          topItem = item
        }
      } else {
        this.itemList[index] = item
      }
    }

    this.itemList = this.itemList.sort(less).slice()

    if (topItem) this.focuseId = topItem.actId
  }

  @action
  removeItems(ids: number[]) {
    const l = this.itemList.length
    const newItemList: ActItemInfo[] = []

    for (let i = 0; i < l; i++) {
      const item = this.itemList[i]
      if (ids.includes(item.actId)) continue
      newItemList.push(item)
    }

    this.itemList = newItemList

    const idx = this.itemList.findIndex(el => el.actId === this.focuseId)
    if (idx === -1) {
      this.focuseId = this.itemList[0]?.actId || 0
    }
  }
}

const service = new ActService()

export default service
