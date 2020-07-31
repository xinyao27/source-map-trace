import type { PathLike } from "fs";
import {
  getTheSourceByLineAndColumn,
  getTheSourceByError,
} from "./getTheSource";
import type { ErrorDetail, RawSourceMap } from "./interfaces";
import { LOG_PREFIX } from "./constants";

class SourceMapTrace {
  readonly sourceMap: PathLike | RawSourceMap;
  constructor(sourceMap: PathLike | RawSourceMap) {
    this.sourceMap = sourceMap;
  }

  async fromLineAndColumn(line: number, column: number) {
    if (!this.sourceMap) {
      throw new Error(
        `${LOG_PREFIX} fromLineAndColumn failed, please check the sourceMap is correct!`
      );
    }
    return await getTheSourceByLineAndColumn(this.sourceMap, line, column);
  }

  async fromError(error: ErrorDetail) {
    if (!this.sourceMap) {
      throw new Error(
        `${LOG_PREFIX} fromError failed, please check the sourceMap is correct!`
      );
    }
    return await getTheSourceByError(this.sourceMap, error);
  }
}

export default SourceMapTrace;
