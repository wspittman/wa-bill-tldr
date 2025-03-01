import { promises as fs } from "fs";
import path from "path";

export async function readJsonFile<T>(
  filePath: string[]
): Promise<T | undefined> {
  try {
    const data = await fs.readFile(pathJoin(filePath), "utf8");
    return JSON.parse(data) as T;
  } catch (error) {
    return undefined;
  }
}

export async function writeJsonFile<T>(
  data: T,
  filePath: string[]
): Promise<void> {
  await fs.writeFile(pathJoin(filePath), JSON.stringify(data, null, 2), "utf8");
}

function pathJoin(parts: string[]): string {
  return path.join(process.cwd(), ...parts);
}
