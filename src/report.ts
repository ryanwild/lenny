import { writeFileSync } from "node:fs";
import { ExtractedPageData } from "./lib";

export function writeJSONReport(
  pageData: Map<string, ExtractedPageData>,
  filename = "report.json",
): void {
  const toSerialize: Record<string, ExtractedPageData> = {}
  const data = Array.from(pageData.entries()).sort()
  for (const [url, page] of data) {
    toSerialize[url] = page
  }
  const json = JSON.stringify(toSerialize, null, 2)
  writeFileSync(filename, json)
}
