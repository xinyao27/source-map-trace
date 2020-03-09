import * as path from 'path'
import * as fs from 'fs'
import SourceMapTrace from '../source-map-trace'

describe('source-map-trace', () => {
  const sourceMap = path.resolve(__dirname, './sourceMap/app.js.map')
  const line = 43
  const column = 12231
  const target = [
    { highlight: false, number: 14, code: '  methods: {' },
    { highlight: false, number: 15, code: '    throwError(){' },
    { highlight: true, number: 16, code: "      throw new Error('test')" },
    { highlight: false, number: 17, code: '    },' },
    { highlight: false, number: 18, code: '    fetchError(){' },
    { highlight: false, number: 19, code: '      const data = { a: 1 }' }
  ]

  test('Should be able to parse the source code correctly', async () => {
    const result = await SourceMapTrace(sourceMap, line, column)

    expect(result).toEqual(target)
  })

  test('Should be able to parse the source code correctly after passing in the map file', async () => {
    const sourceMapFile = fs.readFileSync(sourceMap, { encoding: 'utf8' })
    const rawSourceMap = JSON.parse(sourceMapFile.toString())
    const result = await SourceMapTrace(rawSourceMap, line, column)

    expect(result).toEqual(target)
  })

  test('It should throw error after passing in the error message', async () => {
    await expect(SourceMapTrace(sourceMap, 1, 1)).rejects.toThrow()
  })
})
