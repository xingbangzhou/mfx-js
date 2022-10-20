import IFrameModule from 'src/modules/IFrameModule'
import McoModule from '../Module'
import McoFrameworkContext from './FrameworkContext'
import McoModuleCleaner from './ModuleCleaner'

enum McoModuleType {
  Module,
  IFrame,
}

class McoModuleHolder {
  constructor(fwCtx: McoFrameworkContext, mId: string, type: McoModuleType, ...args: any[]) {
    switch (type) {
      case McoModuleType.IFrame:
        this._module = new IFrameModule(fwCtx, this.cleaner, mId, args[0])
        break
      default:
        this._module = new McoModule(fwCtx, this.cleaner, mId)
        break
    }
  }

  private _module: McoModule
  private invalid = false
  private cleaner = new McoModuleCleaner()

  get module() {
    return this._module
  }

  unload() {
    if (this.invalid) return
    this.invalid = true
    this.cleaner.clean()
  }
}

export default class McoModules {
  constructor(fwCtx: McoFrameworkContext) {
    this.fwCtx = fwCtx
  }

  private fwCtx: McoFrameworkContext
  private mholders?: Record<string, McoModuleHolder>

  getModule(mId: string) {
    return this.mholders?.[mId]?.module
  }

  load(mId: string) {
    if (!mId) return
    return this.insertModule(mId, McoModuleType.Module)
  }

  loadIFrame(mId: string, container: HTMLIFrameElement) {
    if (!mId) return
    return this.insertModule(mId, McoModuleType.IFrame, container)
  }

  unload(mId: string) {
    if (!this.mholders) return

    const holder = this.mholders[mId]
    if (!holder) return

    holder.unload()
    delete this.mholders[mId]
  }

  private insertModule(mId: string, type: McoModuleType, ...args: any[]) {
    let holder: McoModuleHolder | undefined = undefined
    if (!this.mholders) this.mholders = {}
    if (!this.mholders[mId]) {
      holder = new McoModuleHolder(this.fwCtx, mId, type, ...args)
      this.mholders[mId] = holder
    }
    return holder?.module
  }
}
