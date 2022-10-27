import McoModule from './Module'
import McoFrameworkContext from './privates/FrameworkContext'
import logger from './privates/logger'
import McoModuleCleaner from './privates/ModuleCleaner'

export default class McoFramework extends McoModule {
  constructor(fwCtx: McoFrameworkContext) {
    super(fwCtx, new McoModuleCleaner(), '')
    this.fwCtx = fwCtx
  }

  private inited = false
  private fwCtx: McoFrameworkContext

  init() {
    if (this.inited) return
    this.inited = true
    logger.log('McoFramework.init')

    window['mco.framework'] = true
  }

  getModule(mId: string) {
    const {fwCtx} = this

    return fwCtx.modules?.getModule(mId)
  }

  loadModule(mId: string) {
    logger.log('McoFramework.loadModule', mId)

    const {fwCtx} = this
    const module = fwCtx.modules.load(mId)

    return module
  }

  loadFrameModule(mId: string, container: HTMLIFrameElement) {
    logger.log('McoFramework.loadFrameModule', mId, container)

    const {fwCtx} = this
    const module = fwCtx.modules.loadFrame(mId, container)

    return module
  }

  unloadModule(mId: string) {
    logger.log('McoFramework.unloadModule', mId)

    const {fwCtx} = this

    fwCtx.modules.unload(mId)
  }
}
