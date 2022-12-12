import {MscxService} from '@mscx/framework'
import {action, makeObservable, observable} from 'mobx'
import {ActItemProps} from './types'

function less(lhs: ActItemProps, rhs: ActItemProps) {
  return (rhs.priority || 0) - (lhs.priority || 0)
}

function actInfoSignal(actId: number) {
  return `ActInfoSignal_#${actId}`
}

class ActivityContext extends MscxService {
  constructor() {
    super('ActivityService')
    makeObservable(this)

    this.registerInvoke('getActInfo', this.getActInfo)
  }

  @observable
  itemList: ActItemProps[] = []

  @observable
  focuseId = 0

  private actInfos: Record<number, any> = {}

  getActInfo(actId: number) {
    return this.actInfos[actId]
  }

  setActInfo(actId: number, actInfo: any) {
    this.actInfos[actId] = actInfo

    this.emitSignal(actInfoSignal(actId), actInfo)
  }

  @action
  add(items: ActItemProps[]) {
    if (items.length <= 0) return

    let focuseItem: ActItemProps | undefined = undefined
    for (let i = 0, l = items.length; i < l; i++) {
      const info = items[i]
      const index = this.itemList.findIndex(el => el.actId === info.actId)
      if (index === -1) {
        this.itemList.push(info)
        if (!focuseItem || less(focuseItem, info) > 0) {
          focuseItem = info
        }
      } else {
        this.itemList[index] = info
      }
    }

    this.itemList = this.itemList.sort(less).slice()

    if (focuseItem) this.focuseId = focuseItem.actId
  }

  @action
  remove(ids: number[]) {
    const ll: ActItemProps[] = []

    for (let i = 0, l = this.itemList.length; i < l; i++) {
      const info = this.itemList[i]
      if (ids.includes(info.actId)) continue
      ll.push(info)
    }

    this.itemList = ll

    const idx = this.itemList.findIndex(el => el.actId === this.focuseId)
    if (idx === -1) {
      this.focuseId = this.itemList[0]?.actId
    }
  }
}

const ctx = new ActivityContext()

export default ctx
