import {MxModuleContext} from '.'
import MxModule, {MxExModule} from './Module'
import MxFrameworkContext from './privates/FrameworkContext'
import {MxDestructor} from './types'

const ctx = self as any

export default class MxFramework extends MxModule {
  constructor(fwCtx: MxFrameworkContext) {
    const destructor = new MxDestructor()
    super(new MxModuleContext('', fwCtx, destructor), destructor)
    this._fwCtx = fwCtx
  }

  private _inited = false
  private _fwCtx: MxFrameworkContext

  init() {
    if (this._inited) return
    this._inited = true
    ctx['_MxFramework_'] = true
    this.ctx.logger.log('MxFramework', 'init()')
  }

  getModule(id: string) {
    const {_fwCtx} = this

    return _fwCtx.modules?.getModule(id)
  }

  loadModule(id: string) {
    this.ctx.logger.log('MxFramework', 'loadModule: ', id)
    const {_fwCtx} = this

    const mxModule = _fwCtx.modules.load(id)

    return mxModule
  }

  loadExModule<T extends MxExModule>(
    className: {new (ctx: MxModuleContext, destructor: MxDestructor, ...args: any[]): T},
    id: string,
    ...args: any[]
  ) {
    this.ctx.logger.log('MxFramework', 'loadExModule: ', id, ...args)
    const {_fwCtx} = this

    const exModule = _fwCtx.modules.loadEx(className, id, ...args)

    return exModule
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
}
