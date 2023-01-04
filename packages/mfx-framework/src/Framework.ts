import MfxModule from './Module'
import MfxFrameworkContext from './privates/FrameworkContext'
import MfxModuleCleaner from './privates/ModuleCleaner'

export default class MfxFramework extends MfxModule {
  constructor(fwCtx: MfxFrameworkContext) {
    super(fwCtx, new MfxModuleCleaner(), '')
    this.fwCtx = fwCtx
  }

  private inited = false
  private fwCtx: MfxFrameworkContext

  init() {
    if (this.inited) return
    this.ctx.logger.log('MfxFramework:initial.')

    this.inited = true
    window['_MfxFramework_'] = true

    this.init0()
  }

  getModule(id: string) {
    const {fwCtx} = this

    return fwCtx.modules?.getModule(id)
  }

  loadModule(id: string) {
    this.ctx.logger.log('MfxFramework:loadModule: ', id)
    const {fwCtx} = this

    const module = fwCtx.modules.load(id)

    return module
  }

  loadFrameModule(id: string, container: HTMLIFrameElement) {
    this.ctx.logger.log('MfxFramework:loadFrameModule: ', id, container)
    const {fwCtx} = this

    const module = fwCtx.modules.loadFrame(id, container)

    return module
  }

  unloadModule(id: string) {
    this.ctx.logger.log('MfxFramework:unloadModule: ', id)
    const {fwCtx} = this

    fwCtx.modules.unload(id)
  }

  private init0() {}
}
