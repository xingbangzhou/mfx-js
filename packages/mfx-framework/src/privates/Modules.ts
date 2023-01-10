import FrameModule from './modules/FrameModule'
import MfxModule from '../Module'
import MfxFrameworkContext from './FrameworkContext'
import MfxModuleCleaner from './ModuleCleaner'

enum MfxModuleType {
  Module,
  Frame,
}

class MfxModuleHolder {
  constructor(fwCtx: MfxFrameworkContext, id: string, type: MfxModuleType, ...args: any[]) {
    switch (type) {
      case MfxModuleType.Frame:
        this._module = new FrameModule(fwCtx, this.cleaner, id, args[0])
        break
      default:
        this._module = new MfxModule(fwCtx, this.cleaner, id)
        break
    }
  }

  private _module: MfxModule
  private invalid = false
  private cleaner = new MfxModuleCleaner()

  get module() {
    return this._module
  }

  unload() {
    if (this.invalid) return
    this.invalid = true
    this.cleaner.clean()
  }
}

export default class MfxModules {
  constructor(fwCtx: MfxFrameworkContext) {
    this.fwCtx = fwCtx
  }

  private fwCtx: MfxFrameworkContext
  private holders: Record<string, MfxModuleHolder> = {}

  getModule(id: string) {
    return this.holders[id]?.module
  }

  load(id: string) {
    if (!id) return
    return this.load0(id, MfxModuleType.Module)
  }

  loadFrame(id: string, container: HTMLIFrameElement) {
    if (!id) return
    return this.load0(id, MfxModuleType.Frame, container)
  }

  unload(id: string) {
    const holder = this.holders[id]
    if (!holder) return

    holder.unload()
    delete this.holders[id]
  }

  private load0(id: string, type: MfxModuleType, ...args: any[]) {
    let holder: MfxModuleHolder | undefined = undefined
    if (!this.holders[id]) {
      holder = new MfxModuleHolder(this.fwCtx, id, type, ...args)
      this.holders[id] = holder
    }
    return holder?.module
  }
}
