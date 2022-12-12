import {MscxModuleContextFuncs} from './types'
import MscxModuleContext from './ModuleContext'
import MscxFrameworkContext from './privates/FrameworkContext'
import logger from './privates/logger'
import MscxModuleCleaner from './privates/ModuleCleaner'

export default class MscxModule {
  constructor(fwCtx: MscxFrameworkContext, cleaner: MscxModuleCleaner, id: string) {
    this._id = id
    cleaner.bindUnloadFn(() => this.unload())
    this._ctx = new MscxModuleContext(this, fwCtx, cleaner)
  }

  private _id: string
  private _ctx: MscxModuleContext

  get id() {
    return this._id
  }

  get ctx(): MscxModuleContextFuncs {
    return this._ctx
  }

  protected unload() {
    logger.log('MscxPlugin', 'unload: ', this.id)
  }
}
