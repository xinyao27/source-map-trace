import * as path from "path";
import * as fs from "fs";
import {
  getTheSourceByLineAndColumn,
  getTheSourceByError,
} from "../getTheSource";

describe("getTheSourceByLineAndColumn", () => {
  const sourceMap = path.resolve(__dirname, "./sourceMap/app.js.map");
  const line = 43;
  const column = 12231;
  const parsed = {
    column: 12,
    line: 16,
    name: null,
    source: "webpack:///src/components/HelloWorld.vue",
  };
  const code = [
    { highlight: false, number: 14, code: "  methods: {" },
    { highlight: false, number: 15, code: "    throwError(){" },
    { highlight: true, number: 16, code: "      throw new Error('test')" },
    { highlight: false, number: 17, code: "    }," },
    { highlight: false, number: 18, code: "    fetchError(){" },
    { highlight: false, number: 19, code: "      const data = { a: 1 }" },
  ];

  test("Should be able to parse the source code correctly", async () => {
    const result = await getTheSourceByLineAndColumn(sourceMap, line, column);

    expect(result.parsed).toEqual(parsed);
    expect(result.code).toEqual(code);
  });

  test("Should be able to parse the source code correctly after passing in the map file", async () => {
    const sourceMapFile = fs.readFileSync(sourceMap, { encoding: "utf8" });
    const rawSourceMap = JSON.parse(sourceMapFile.toString());
    const result = await getTheSourceByLineAndColumn(
      rawSourceMap,
      line,
      column
    );

    expect(result.parsed).toEqual(parsed);
    expect(result.code).toEqual(code);
  });

  test("It should throw error after passing in the error message", async () => {
    await expect(
      getTheSourceByLineAndColumn(sourceMap, 1, 1)
    ).rejects.toThrow();
  });
});

describe("getTheSourceByError", () => {
  const sourceMap = path.resolve(__dirname, "./sourceMap/app.96d3bcc4.js.map");
  const error = {
    name: "Error",
    message: "Uncaught Error: throw UNCAUGHT_ERROR",
    filename: "http://127.0.0.1:8080/js/app.96d3bcc4.js",
    lineno: 31,
    colno: 2855,
    stack:
      "Error: throw UNCAUGHT_ERROR\\n    at HTMLButtonElement.<anonymous> (http://127.0.0.1:8080/js/app.96d3bcc4.js:31:2855)",
  };
  const parsed = {
    source: "webpack:///src/scripts/event.js",
    line: 22,
    column: 8,
    name: null,
  };
  const code = [
    {
      highlight: false,
      number: 20,
      code: "const UNCAUGHT_ERROR = document.querySelector('#UNCAUGHT_ERROR')",
    },
    {
      highlight: false,
      number: 21,
      code: "UNCAUGHT_ERROR.addEventListener('click', (e) => {",
    },
    {
      highlight: true,
      number: 22,
      code: "  throw new Error('throw UNCAUGHT_ERROR')",
    },
    { highlight: false, number: 23, code: "})" },
    {
      highlight: false,
      number: 24,
      code: "const UNHANDLEDREJECTION_ERROR = document.querySelector(",
    },
    {
      highlight: false,
      number: 25,
      code: "  '#UNHANDLEDREJECTION_ERROR'",
    },
  ];
  test("Should be able to parse the source code correctly", async () => {
    const result = await getTheSourceByError(sourceMap, error);
    expect(result.parsed).toEqual(parsed);
    expect(result.code).toEqual(code);
  });
});
