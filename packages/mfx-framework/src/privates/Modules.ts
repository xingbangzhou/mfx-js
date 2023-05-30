import MxModule, {MxExModule} from '../Module'
import MxFrameworkContext from './FrameworkContext'
import {MxDestructor} from '../types'
import MxModuleContext from '../ModuleContext'
import MxFrameModule from '../Module/FrameModule'

class MxModuleHolder<T extends MxModule> {
  constructor(
    className: {new (ctx: MxModuleContext, destructor: MxDestructor, ...args: any[]): T},
    fwCtx: MxFrameworkContext,
    id: string,
    ...args: any[]
  ) {
    this._module = new className(new MxModuleContext(id, fwCtx, this._destructor), this._destructor, ...args)
  }

  private _module: MxModule
  private _invalid = false
  private _destructor = new MxDestructor()

  get module() {
    return this._module
  }

  unload() {
    if (this._invalid) return
    this._invalid = true
    this._destructor.destruct()
  }
}

export default class MxModules {
  constructor(fwCtx: MxFrameworkContext) {
    this.fwCtx = fwCtx
  }

  private fwCtx: MxFrameworkContext
  private holders: Record<string, MxModuleHolder<MxModule>> = {}

  getModule(id: string) {
    return this.holders[id]?.module
  }

  load(id: string) {
    if (!id) return
    return this.load0(MxModule, id)
  }

  loadEx<T extends MxExModule>(
    className: {new (ctx: MxModuleContext, destructor: MxDestructor, ...args: any[]): T},
    id: string,
    ...args: any[]
  ) {
    if (!id) return
    return this.load0(className, id)
  }

  loadFrame(id: string, container: HTMLIFrameElement) {
    if (!id) return
    return this.load0(MxFrameModule, id, container)
  }

  unload(id: string) {
    const holder = this.holders[id]
    if (!holder) return

    holder.unload()
    delete this.holders[id]
  }

  private load0<T extends MxModule>(
    className: {new (ctx: MxModuleContext, destructor: MxDestructor, ...args: any[]): T},
    id: string,
    ...args: any[]
  ) {
    let holder: MxModuleHolder<T> | undefined = undefined
    if (!this.holders[id]) {
      holder = new MxModuleHolder(className, this.fwCtx, id, ...args)
      this.holders[id] = holder
    }
    return holder?.module
  }
}
