export interface SourceMapTraceCode {
  highlight: boolean
  number: number
  code: string
}

export interface Result {
  parsed: any
  code?: SourceMapTraceCode[]
}

export interface RawSourceMap {
  version: number
  file: string
  sourceRoot: string
  sources: string[]
  names: string[]
  mappings: string
}

export interface ErrorDetail {
  name: string
  message: string
  stack: string
  [key: string]: any
}
