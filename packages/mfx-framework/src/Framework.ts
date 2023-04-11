import MxModule from './Module'
import MxFrameworkContext from './privates/FrameworkContext'
import MxModuleDestructor from './privates/ModuleDestructor'

export default class MxFramework extends MxModule {
  constructor(fwCtx: MxFrameworkContext) {
    super(fwCtx, new MxModuleDestructor(), '')
    this._fwCtx = fwCtx
  }

  private _inited = false
  private _fwCtx: MxFrameworkContext

  init() {
    if (this._inited) return
    this._inited = true
    this.ctx.logger.log('MxFramework', 'init')
    window['_MxFramework_'] = true

    this.init0()
  }

  getModule(id: string) {
    const {_fwCtx} = this

    return _fwCtx.modules?.getModule(id)
  }

  loadModule(id: string) {
    this.ctx.logger.log('MxFramework', 'loadModule: ', id)
    const {_fwCtx} = this

    const yomodule = _fwCtx.modules.load(id)

    return yomodule
  }

  loadFrameModule(id: string, container: HTMLIFrameElement) {
    this.ctx.logger.log('MxFramework', 'loadFrameModule: ', id)
    const {_fwCtx} = this

    const frameModule = _fwCtx.modules.loadFrame(id, container)

    return frameModule
  }

  unloadModule(id: string) {
    this.ctx.logger.log('MxFramework', 'unloadModule: ', id)
    const {_fwCtx} = this

    _fwCtx.modules.unload(id)
  }

  private init0() {}
}
