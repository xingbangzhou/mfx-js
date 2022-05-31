import {EventEmitter} from 'src/utils/eventemitter'
import Cocos2d from './Cocos2d'
import MP4Player from './MP4Player'
import Office from './Office'

export class BizEventMap {
  'activedChanged': (value?: string) => void
}

class BizCenter {
  readonly bizList = [
    {
      id: 'leason',
      title: 'Leason',
      items: [
        {id: 'mp4player', name: 'MP4Player', component: MP4Player},
        {id: 'cocos2d', name: 'Cocos2d', component: Cocos2d},
      ],
    },
    {
      id: 'products',
      title: 'Products',
      items: [{id: 'office', name: 'Office', component: Office}],
    },
  ]
  private _activedId: string | undefined = 'mp4player'
  private emitter = new EventEmitter()

  addListener<K extends keyof BizEventMap>(type: K, listener: BizEventMap[K], prepend = false) {
    return this.emitter.on(type, listener, undefined, prepend)
  }

  removeListener<K extends keyof BizEventMap>(type: K, listener: BizEventMap[K]) {
    this.emitter.off(type, listener)
  }

  set activedId(id: string | undefined) {
    this._activedId = id
    this.emitter.emit('activedChanged', this.activedId)
  }

  get activedId() {
    return this._activedId
  }

  getItem(id?: string) {
    id = id || this._activedId
    for (let i = 0; i < this.bizList.length; i++) {
      const item = this.bizList[i].items.find(el => el.id === id)
      if (item) return item
    }
    return undefined
  }
}

const bizCenter = new BizCenter()

export default bizCenter
