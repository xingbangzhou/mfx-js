import McoFrameworkContext from 'src/privates/FrameworkContext'
import McoModuleCleaner from 'src/privates/ModuleCleaner'
import McoModule from '../Module'

export default class IFrameModule extends McoModule {
  constructor(fwCtx: McoFrameworkContext, cleaner: McoModuleCleaner, id: string, container: HTMLIFrameElement) {
    super(fwCtx, cleaner, id)
  }
}
