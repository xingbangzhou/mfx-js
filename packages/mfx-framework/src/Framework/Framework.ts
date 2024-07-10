import MfxModule, {MfxExModule} from '../Module'
import MfxFrameworkContext from './FrameworkContext'
import MfxDestructor from '../Destructor'
import {MfxModuleContext} from '../Module'

export default class MfxFramework extends MfxModule {
  constructor(fwCtx: MfxFrameworkContext) {
    const destructor = new MfxDestructor()
    super(new MfxModuleContext('', fwCtx, destructor), destructor)

    this._fwCtx = fwCtx
  }

  private _fwCtx: MfxFrameworkContext

  getModule(id: string) {
    const {_fwCtx} = this

    return _fwCtx.modules?.getModule(id)
  }

  loadModule(id: string) {
    this.ctx.logger.log('MfxFramework', 'loadModule: ', id)
    const {_fwCtx} = this

    const mfxModule = _fwCtx.modules.load(id)

    return mfxModule
  }

  loadExModule<T extends MfxExModule>(
    className: {new (ctx: MfxModuleContext, destructor: MfxDestructor, ...args: any[]): T},
    id: string,
    ...args: any[]
  ) {
    this.ctx.logger.log('MfxFramework', 'loadExModule: ', id, ...args)
    const {_fwCtx} = this

    const exModule = _fwCtx.modules.loadEx(className, id, ...args)

    return exModule
  }

  loadFrameModule(id: string, container: HTMLIFrameElement) {
    this.ctx.logger.log('MfxFramework', 'loadFrameModule: ', id)
    const {_fwCtx} = this

    const frameModule = _fwCtx.modules.loadFrame(id, container)

    return frameModule
  }

  unloadModule(id: string) {
    this.ctx.logger.log('MfxFramework', 'unloadModule: ', id)
    const {_fwCtx} = this

    _fwCtx.modules.unload(id)
  }
}
