interface Fn {
  (): void
}

export default class MfxModuleCleaner {
  private unloadFn?: Fn
  private clearFn?: Fn

  bindUnloadFn(fn: Fn) {
    this.unloadFn = fn
  }

  bindClearFn(fn: Fn) {
    this.clearFn = fn
  }

  clean() {
    this.clearFn?.()
    this.unloadFn?.()
  }
}
