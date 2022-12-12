import MscxModule from './Module'
import MscxFrameworkContext from './privates/FrameworkContext'
import logger from './privates/logger'
import MscxModuleCleaner from './privates/ModuleCleaner'

export default class MscxFramework extends MscxModule {
  constructor(fwCtx: MscxFrameworkContext) {
    super(fwCtx, new MscxModuleCleaner(), '')
    this.fwCtx = fwCtx
  }

  private inited = false
  private fwCtx: MscxFrameworkContext

  init() {
    if (this.inited) return
    this.inited = true
    logger.log('MscxFramework', 'initial.')

    window['_MscxFramework_'] = true
  }

  getModule(id: string) {
    const {fwCtx} = this

    return fwCtx.modules?.getModule(id)
  }

  loadModule(id: string) {
    logger.log('MscxFramework', 'loadModule: ', id)
    const {fwCtx} = this

    const module = fwCtx.modules.load(id)

    return module
  }

  loadFrameModule(id: string, container: HTMLIFrameElement) {
    logger.log('MscxFramework', 'loadFrameModule: ', id, container)
    const {fwCtx} = this

    const module = fwCtx.modules.loadFrame(id, container)

    return module
  }

  unloadModule(id: string) {
    logger.log('MscxFramework', 'unloadModule: ', id)
    const {fwCtx} = this

    fwCtx.modules.unload(id)
  }
}
