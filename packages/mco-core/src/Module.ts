import {McoModuleContextFuncs} from './types'
import McoModuleContext from './ModuleContext'
import McoFrameworkContext from './privates/FrameworkContext'
import logger from './privates/logger'
import McoModuleCleaner from './privates/ModuleCleaner'

export default class McoModule {
  constructor(fwCtx: McoFrameworkContext, cleaner: McoModuleCleaner, id: string) {
    this._id = id
    cleaner.bindUnload(() => this.unload())
    this._ctx = new McoModuleContext(this, fwCtx, cleaner)
  }

  private _id: string
  private _ctx: McoModuleContext

  get id() {
    return this._id
  }

  get ctx(): McoModuleContextFuncs {
    return this._ctx
  }

  protected unload() {
    logger.log('McoModule', 'unload: ', this.id)
  }
}
