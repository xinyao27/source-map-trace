import { SourceMapConsumer } from 'source-map'
import { PathLike, readFileSync } from 'fs'

const LOG_PREFIX = `[SourceMapTrace]`

export interface SourceMapTraceCode {
  highlight: boolean
  number: number
  code: string
}
export interface RawSourceMap {
  version: number
  file: string
  sourceRoot: string
  sources: string[]
  names: string[]
  mappings: string
}

async function SourceMapTrace(
  sourceMap: PathLike | RawSourceMap,
  line: number,
  column: number
): Promise<SourceMapTraceCode[]> {
  let rawSourceMap
  if (typeof sourceMap === 'string') {
    const sourceMapFile = readFileSync(sourceMap, { encoding: 'utf8' })
    rawSourceMap = JSON.parse(sourceMapFile.toString())
  } else {
    rawSourceMap = sourceMap
  }
  const parsed = await SourceMapConsumer.with(
    rawSourceMap,
    null,
    async consumer => {
      // 得到压缩前的源码位置
      return consumer.originalPositionFor({
        line,
        column
      })
    }
  )

  if (!parsed.source || !parsed.line) {
    throw new Error(
      `${LOG_PREFIX} SourceMap parsing failed, please check the SourceMapFile/line/column is correct!`
    )
  }
  const {
    // 所有压缩前的源码 是一个数组
    sourcesContent,
    // 所有压缩前的源码文件名 是一个数组 且与 sourcesContent 数组位置一一对应
    sources
  } = rawSourceMap
  // 根据 parsed 的 source 找到在 fileContent.sources 的位置
  const sourcesContentIndex = sources.indexOf(parsed.source)
  // 根据二者数组位置一一对应 可得到压缩前的源码
  const sourceCode = sourcesContent[sourcesContentIndex]

  const lines = sourceCode.split('\n')
  const length = lines.length
  // 取 stack 位置 6 行内的 code
  const start = parsed.line >= 3 ? parsed.line - 3 : 0
  const end = start + 5 >= length ? length : start + 5

  const result = []
  for (let i = start; i <= end; i++) {
    result.push({
      highlight: i + 1 === parsed.line,
      number: i + 1,
      code: lines[i]
    })
  }

  return result
}

export default SourceMapTrace
