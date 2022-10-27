export type McoModeType = 'development' | 'production' | 'serve' | undefined

export type McoOptions = {
  env?: string
  hot?: boolean
  open?: boolean
  progress?: boolean
  analyze?: boolean
}
