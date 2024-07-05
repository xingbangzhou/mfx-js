import MfxModule, {MfxExModule} from '../Module'
import MfxFrameworkContext from './FrameworkContext'
import {MfxDestructor} from '../types'
import MfxModuleContext from '../ModuleContext'
import MfxFrameModule from '../Module/FrameModule'

class MfxModuleHolder<T extends MfxModule> {
  constructor(
    className: {new (ctx: MfxModuleContext, destructor: MfxDestructor, ...args: any[]): T},
    fwCtx: MfxFrameworkContext,
    id: string,
    ...args: any[]
  ) {
    this._module = new className(new MfxModuleContext(id, fwCtx, this._destructor), this._destructor, ...args)
  }

  private _module: MfxModule
  private _invalid = false
  private _destructor = new MfxDestructor()

  get module() {
    return this._module
  }

  unload() {
    if (this._invalid) return
    this._invalid = true
    this._destructor.destruct()
  }
}

export default class MfxModules {
  constructor(fwCtx: MfxFrameworkContext) {
    this.fwCtx = fwCtx
  }

  private fwCtx: MfxFrameworkContext
  private holders: Record<string, MfxModuleHolder<MfxModule>> = {}

  getModule(id: string) {
    return this.holders[id]?.module
  }

  load(id: string) {
    if (!id) return
    return this.load0(MfxModule, id)
  }

  loadEx<T extends MfxExModule>(
    className: {new (ctx: MfxModuleContext, destructor: MfxDestructor, ...args: any[]): T},
    id: string,
    ...args: any[]
  ) {
    if (!id) return
    return this.load0(className, id, ...args)
  }

  loadFrame(id: string, container: HTMLIFrameElement) {
    if (!id) return
    return this.load0(MfxFrameModule, id, container)
  }

  unload(id: string) {
    const holder = this.holders[id]
    if (!holder) return

    holder.unload()
    delete this.holders[id]
  }

  private load0<T extends MfxModule>(
    className: {new (ctx: MfxModuleContext, destructor: MfxDestructor, ...args: any[]): T},
    id: string,
    ...args: any[]
  ) {
    let holder: MfxModuleHolder<T> | undefined = undefined
    if (!this.holders[id]) {
      holder = new MfxModuleHolder(className, this.fwCtx, id, ...args)
      this.holders[id] = holder
    }
    return holder?.module
  }
}
