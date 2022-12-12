import FrameModule from '../modules/FrameModule'
import MscxModule from '../Module'
import MscxFrameworkContext from './FrameworkContext'
import MscxModuleCleaner from './ModuleCleaner'

enum MscxModuleType {
  Module,
  Frame,
}

class MscxModuleHolder {
  constructor(fwCtx: MscxFrameworkContext, mId: string, type: MscxModuleType, ...args: any[]) {
    switch (type) {
      case MscxModuleType.Frame:
        this._module = new FrameModule(fwCtx, this.cleaner, mId, args[0])
        break
      default:
        this._module = new MscxModule(fwCtx, this.cleaner, mId)
        break
    }
  }

  private _module: MscxModule
  private invalid = false
  private cleaner = new MscxModuleCleaner()

  get module() {
    return this._module
  }

  unload() {
    if (this.invalid) return
    this.invalid = true
    this.cleaner.clean()
  }
}

export default class MscxModules {
  constructor(fwCtx: MscxFrameworkContext) {
    this.fwCtx = fwCtx
  }

  private fwCtx: MscxFrameworkContext
  private holders: Record<string, MscxModuleHolder> = {}

  getModule(id: string) {
    return this.holders[id]?.module
  }

  load(id: string) {
    if (!id) return
    return this.load0(id, MscxModuleType.Module)
  }

  loadFrame(mId: string, container: HTMLIFrameElement) {
    if (!mId) return
    return this.load0(mId, MscxModuleType.Frame, container)
  }

  unload(id: string) {
    const holder = this.holders[id]
    if (!holder) return

    holder.unload()
    delete this.holders[id]
  }

  private load0(id: string, type: MscxModuleType, ...args: any[]) {
    let holder: MscxModuleHolder | undefined = undefined
    if (!this.holders[id]) {
      holder = new MscxModuleHolder(this.fwCtx, id, type, ...args)
      this.holders[id] = holder
    }
    return holder?.module
  }
}
