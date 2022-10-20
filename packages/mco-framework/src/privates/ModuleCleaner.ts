interface CleanFn {
  (): void
}

export default class McoModuleCleaner {
  private unloadFn?: CleanFn
  private clearFn?: CleanFn

  bindUnloadFn(fn: CleanFn) {
    this.unloadFn = fn
  }

  bindClearFn(fn: CleanFn) {
    this.clearFn = fn
  }

  clean() {
    this.clearFn?.()
    this.unloadFn?.()
  }
}
