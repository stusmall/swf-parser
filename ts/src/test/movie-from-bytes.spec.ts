import chai from "chai";
import fs from "fs";
import { JsonReader } from "kryo/readers/json";
import { JsonValueWriter } from "kryo/writers/json-value";
import sysPath from "path";
import meta from "./meta.js";
import { movieFromBytes } from "../lib";
import { Movie } from "swf-tree";
import { $Movie } from "swf-tree/movie";

const PROJECT_ROOT: string = sysPath.join(meta.dirname, "..", "..", "..");
const TEST_SAMPLES_ROOT: string = sysPath.join(PROJECT_ROOT, "..", "tests", "open-flash-db", "standalone-movies");

const JSON_READER: JsonReader = new JsonReader();
const JSON_VALUE_WRITER: JsonValueWriter = new JsonValueWriter();

describe("movieFromBytes", function () {
  for (const sample of getSamples()) {
    it(sample.name, async function () {
      const inputBytes: Buffer = await readFile(sysPath.join(TEST_SAMPLES_ROOT, sample.name, "main.swf"));
      const actualMovie: Movie = movieFromBytes(inputBytes);
      chai.assert.isTrue($Movie.test(actualMovie));
      const expectedJson: string = await readTextFile(sysPath.join(TEST_SAMPLES_ROOT, sample.name, "ast.json"));
      const expectedMovie: Movie = $Movie.read(JSON_READER, expectedJson);
      try {
        chai.assert.isTrue($Movie.equals(actualMovie, expectedMovie));
      } catch (err) {
        chai.assert.strictEqual(
          JSON.stringify($Movie.write(JSON_VALUE_WRITER, actualMovie), null, 2),
          JSON.stringify($Movie.write(JSON_VALUE_WRITER, expectedMovie), null, 2),
        );
        throw err;
      }
    });
  }
});

async function readTextFile(filePath: fs.PathLike): Promise<string> {
  return new Promise<string>((resolve, reject): void => {
    fs.readFile(filePath, {encoding: "UTF-8"}, (err: NodeJS.ErrnoException | null, data: string): void => {
      if (err !== null) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function readFile(filePath: fs.PathLike): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject): void => {
    fs.readFile(filePath, {encoding: null}, (err: NodeJS.ErrnoException | null, data: Buffer): void => {
      if (err !== null) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

interface Sample {
  name: string;
}

function* getSamples(): IterableIterator<Sample> {
  // yield {name: "blank"};
  yield {name: "hello-world"};
  // yield {name: "homestuck-beta-1"};
  yield {name: "morph-rotating-square"};
  yield {name: "squares"};
}