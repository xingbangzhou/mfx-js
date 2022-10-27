interface CleanFn {
  (): void
}

export default class McoModuleCleaner {
  private unload?: CleanFn
  private clear?: CleanFn

  bindUnload(fn: CleanFn) {
    this.unload = fn
  }

  bindClear(fn: CleanFn) {
    this.clear = fn
  }

  clean() {
    this.clear?.()
    this.unload?.()
  }
}
