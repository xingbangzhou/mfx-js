export default class MxModuleDestructor {
  private _unloader?: () => void
  private _cleaner?: () => void

  bindUnloader(fn: () => void) {
    this._unloader = fn
  }

  bindCleaner(fn: () => void) {
    this._cleaner = fn
  }

  destroy() {
    this._cleaner?.()
    this._unloader?.()
  }
}
