import fs from "fs-extra";
import path from "path";
import yaml from "js-yaml";
import { Book } from "@types";
import { throwWithConsoleError } from "@utils/errors";

// books
const booksDirectory = path.join(process.cwd(), "books");

export function getBookDirNames(): string[] {
  let allDirs;
  try {
    allDirs = fs.readdirSync(booksDirectory);
  } catch (e) {
    throwWithConsoleError(
      "プロジェクトルートにbooksディレクトリを作成してください"
    );
  }
  // return dirs only
  return allDirs?.filter((f) =>
    fs.statSync(path.join(booksDirectory, f)).isDirectory()
  );
}

export function getAllBookSlugs(): string[] {
  return getBookDirNames();
}

export function getAllBooks(fields: string[] = []): Book[] {
  const slugs = getAllBookSlugs();
  const books = slugs.map((slug) => getBookBySlug(slug, fields) || { slug });
  return books;
}

function getConfigYamlData(fullDirPath: string): Book {
  let fileRaw;
  try {
    // try to get config.yaml
    fileRaw = fs.readFileSync(`${fullDirPath}/config.yaml`, "utf8");
  } catch (e) {
    // try to get config.yml
    try {
      fileRaw = fs.readFileSync(`${fullDirPath}/config.yml`, "utf8");
    } catch (e) {}
  }
  // couldn't get yaml files
  if (!fileRaw) {
    return null;
  }
  try {
    return yaml.safeLoad(fileRaw);
  } catch (e) {
    // couldn't load yaml files
    throwWithConsoleError(
      `config.yamlの表記に誤りがあります😿\n ${fullDirPath}/config.yaml`
    );
  }
}

function bufferToDataURL(buffer: Buffer, mediaType: string): string {
  return `data:${mediaType};base64,${buffer.toString("base64")}`;
}

function getImageFileSize(fullPath: string): number {
  const stat = fs.statSync(fullPath);
  return stat.size;
}

function getCoverDataUrl(fullDirPath: string): string | null {
  const fileNameOptions = ["cover.jpg", "cover.jpeg", "cover.png"];
  let bufferImage;
  let mediaType;
  let fileSize;
  for (const fileName of fileNameOptions) {
    const fullPath = `${fullDirPath}/${fileName}`;
    try {
      bufferImage = fs.readFileSync(fullPath);
      mediaType = fileName === "cover.png" ? "image/png" : "image/jpeg";
      fileSize = getImageFileSize(fullPath);
      break;
    } catch (e) {}
  }
  if (!bufferImage) return null;

  if (fileSize > 1000 * 1000) {
    throwWithConsoleError("カバー画像のサイズは1MB以下にしてください");
  }
  return bufferToDataURL(bufferImage, mediaType);
}

export function getBookBySlug(slug: string, fields?: null | string[]): Book {
  const fullDirPath = path.join(booksDirectory, slug.replace(/\//g, "")); // Prevent directory traversal
  const data = getConfigYamlData(fullDirPath);
  if (!data) return null;

  let result: Book = {
    slug,
  };
  // include only specified fields
  if (fields) {
    fields.forEach((field) => {
      if (data[field] !== undefined) {
        result[field] = data[field];
      }
      if (field === "coverDataUrl") {
        result[field] = getCoverDataUrl(fullDirPath);
      }
    });
  } else {
    // or include all
    result = Object.assign(result, data);
    result.coverDataUrl = getCoverDataUrl(fullDirPath);
  }

  return result;
}
