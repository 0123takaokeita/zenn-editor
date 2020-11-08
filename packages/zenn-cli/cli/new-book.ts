import path from "path";
import fs from "fs-extra";
import arg from "arg";
import { cliCommand } from ".";
import {
  generateSlug,
  validateSlug,
  getSlugErrorMessage,
} from "../utils/shared/slug-helper";
import colors from "colors/safe";
import { InvalidOption, NewBookHelpText } from "./constants";

type Options = {
  slug: string;
  title: string;
  published: string;
  summary: string;
  price: number;
};

const generatePlaceholderChapters = (bookDirPath: string): void => {
  const chapterBody = ["---", 'title: ""', "---"].join("\n") + "\n";
  ["example1.md", "example2.md"].forEach((chapterFileName) => {
    try {
      fs.writeFileSync(
        path.join(bookDirPath, chapterFileName),
        chapterBody,
        { flag: "wx" } // Don't overwrite
      );
      console.log(`Chapter 📄${colors.green(chapterFileName)} created.`);
    } catch (e) {
      console.log(colors.red("チャプターファイルの作成時にエラーが発生") + e);
    }
  });
};

export const exec: cliCommand = (argv) => {
  const option: Options = {
    price: 0,
    published: "false",
    slug: "",
    summary: "",
    title: "",
  };
  try {
    const args = arg(
      {
        // Types
        "--slug": String,
        "--title": String,
        "--published": String,
        "--summary": String,
        "--price": Number,
        "--help": Boolean,
        // Alias
        "-h": "--help",
      },
      { argv }
    );

    // if required help, show help text and return.
    const help = args["--help"];
    if (help) {
      console.log(NewBookHelpText);
      return;
    }
    option.slug = args["--slug"] || generateSlug();
    option.title = args["--title"] || "";
    option.summary = args["--summary"] || "";
    option.published = args["--published"] === "true" ? "true" : "false"; // デフォルトはfalse
    option.price = args["--price"] || 0; // デフォルトは¥0
  } catch (e) {
    if (e.code === "ARG_UNKNOWN_OPTION") {
      console.log(colors.red(InvalidOption));
      return;
    }
  }

  const { price, published, slug, title, summary } = option;
  if (!validateSlug(slug)) {
    const errorMessage = getSlugErrorMessage(slug);
    console.error(colors.red(`エラー：${errorMessage}`));
    process.exit(1);
  }
  const bookDirPath = path.join(process.cwd(), "books", slug);
  try {
    fs.mkdirpSync(bookDirPath);
  } catch (e) {
    // already exist => do nothing
  }

  const configYamlBody =
    [
      `title: "${title}"`,
      `summary: "${summary}"`,
      "topics: []",
      `published: ${published}`,
      `price: ${price} # 有料の場合200〜5000`,
      `# 本に含めるチャプターを順番に並べましょう`,
      `chapters:`,
      `  - example1`,
      `  - example2`,
    ].join("\n") + "\n";

  const configYamlPath = path.join(bookDirPath, "config.yaml");

  try {
    fs.writeFileSync(
      configYamlPath,
      configYamlBody,
      { flag: "wx" } // Don't overwrite
    );
    console.log(`🛠${colors.green(`books/${slug}/config.yaml`)} created.`);
  } catch (e) {
    console.log(colors.red("エラーが発生しました") + e);
    process.exit(1);
  }
  generatePlaceholderChapters(bookDirPath);
};
