export type MfxModeType = 'development' | 'production' | 'serve' | undefined

export type MfxOptions = {
  env?: string
  hot?: boolean
  open?: boolean
  progress?: boolean
  analyze?: boolean
}
