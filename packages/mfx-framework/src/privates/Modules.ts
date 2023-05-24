import MxFrameModule from '../Module/FrameModule'
import MxModule from '../Module'
import MxFrameworkContext from './FrameworkContext'
import MxModuleDestructor from './ModuleDestructor'

enum MxModuleType {
  Module,
  Frame,
}

class YoModuleHolder {
  constructor(fwCtx: MxFrameworkContext, id: string, type: MxModuleType, ...args: any[]) {
    switch (type) {
      case MxModuleType.Frame:
        this._module = new MxFrameModule(fwCtx, this._destructor, id, args[0])
        break
      default:
        this._module = new MxModule(fwCtx, this._destructor, id)
        break
    }
  }

  private _module: MxModule
  private _invalid = false
  private _destructor = new MxModuleDestructor()

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
  private holders: Record<string, YoModuleHolder> = {}

  getModule(id: string) {
    return this.holders[id]?.module
  }

  load(id: string) {
    if (!id) return
    return this.load0(id, MxModuleType.Module)
  }

  loadFrame(id: string, container: HTMLIFrameElement) {
    if (!id) return
    return this.load0(id, MxModuleType.Frame, container)
  }

  unload(id: string) {
    const holder = this.holders[id]
    if (!holder) return

    holder.unload()
    delete this.holders[id]
  }

  private load0(id: string, type: MxModuleType, ...args: any[]) {
    let holder: YoModuleHolder | undefined = undefined
    if (!this.holders[id]) {
      holder = new YoModuleHolder(this.fwCtx, id, type, ...args)
      this.holders[id] = holder
    }
    return holder?.module
  }
}
