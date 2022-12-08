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
    logger.log('McoFramework', 'initial.')

    window['_McoFramework_'] = true
  }

  getModule(id: string) {
    const {fwCtx} = this

    return fwCtx.modules?.getModule(id)
  }

  loadModule(id: string) {
    logger.log('McoFramework', 'loadModule: ', id)
    const {fwCtx} = this

    const module = fwCtx.modules.load(id)

    return module
  }

  loadFrameModule(id: string, container: HTMLIFrameElement) {
    logger.log('McoFramework', 'loadFrameModule: ', id, container)
    const {fwCtx} = this

    const module = fwCtx.modules.loadFrame(id, container)

    return module
  }

  unloadModule(id: string) {
    logger.log('McoFramework', 'unloadModule: ', id)
    const {fwCtx} = this

    fwCtx.modules.unload(id)
  }
}
