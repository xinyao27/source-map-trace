import { SourceMapConsumer } from "source-map";
import type { PathLike } from "fs";
import { readFileSync } from "fs";
import { normalize } from "path";
import * as ErrorStackParser from "error-stack-parser";
import { LOG_PREFIX } from "./constants";
import type { ErrorDetail, RawSourceMap, Result } from "./interfaces";

export async function getTheSourceByLineAndColumn(
  sourceMap: PathLike | RawSourceMap,
  line: number,
  column: number
): Promise<Result> {
  let rawSourceMap;
  if (typeof sourceMap === "string") {
    const sourceMapFile = readFileSync(sourceMap, { encoding: "utf8" });
    rawSourceMap = JSON.parse(sourceMapFile.toString());
  } else {
    rawSourceMap = sourceMap;
  }
  const parsed = await SourceMapConsumer.with(
    rawSourceMap,
    null,
    async (consumer) => {
      // 得到压缩前的源码位置
      return consumer.originalPositionFor({
        line,
        column,
      });
    }
  );

  if (!parsed.source || !parsed.line) {
    throw new Error(
      `${LOG_PREFIX} SourceMap parsing failed, please check the SourceMapFile/line/column is correct!`
    );
  }
  const {
    // 所有压缩前的源码 是一个数组
    sourcesContent,
    // 所有压缩前的源码文件名 是一个数组 且与 sourcesContent 数组位置一一对应
    sources,
  } = rawSourceMap;

  // 根据 parsed 的 source 找到在 fileContent.sources 的位置
  const sourcesContentIndex = sources
    .map(normalize)
    .indexOf(normalize(parsed.source));
  if (sourcesContentIndex > -1) {
    // 根据二者数组位置一一对应 可得到压缩前的源码
    const sourceCode = sourcesContent[sourcesContentIndex];
    const lines = sourceCode.split("\n");
    const length = lines.length;
    // 取 stack 位置 6 行内的 code
    const start = parsed.line >= 3 ? parsed.line - 3 : 0;
    const end = start + 5 >= length ? length : start + 5;

    const code = [];
    for (let i = start; i <= end; i++) {
      code.push({
        highlight: i + 1 === parsed.line,
        number: i + 1,
        code: lines[i],
      });
    }

    return { parsed, code };
  }

  return { parsed };
}

export function getStackFrame(errorDetail: ErrorDetail) {
  const error = new Error();
  for (const key in errorDetail) {
    // @ts-ignore
    error[key] = errorDetail[key];
  }
  return ErrorStackParser.parse(error)[0];
}

export async function getTheSourceByError(
  sourceMap: PathLike | RawSourceMap,
  errorDetail: ErrorDetail
) {
  const stackFrame = getStackFrame(errorDetail);

  return getTheSourceByLineAndColumn(
    sourceMap,
    stackFrame.lineNumber!,
    stackFrame.columnNumber!
  );
}
