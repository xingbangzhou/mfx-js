export type MCOModeType = 'development' | 'production' | 'serve' | undefined

export type MCOOptions = {
  env?: string
  hot?: boolean
  open?: boolean
  progress?: boolean
  analyze?: boolean
}
