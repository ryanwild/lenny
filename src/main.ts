import { argv } from "node:process"
import Crawler from "./crawler"
import { ExtractedPageData } from "./lib"
import { writeJSONReport } from "./report"

async function main() {
  const [, , url, concurrency, max] = argv
  if (argv.length > 5) {
    console.error("Wrong number of arguments, expected one")
    process.exit(1)
  }
  if (!url) {
    console.error("Error: Missing url argument")
    process.exit(1)
  }
  const parsedConcurrency = Number.isInteger(Number(concurrency)) ? Number(concurrency) : undefined
  const parsedMax = Number.isInteger(Number(max)) ? Number(max) : undefined
  const pages = await Crawler.crwalSite(url, parsedConcurrency, parsedMax)
  console.log(pages)
  console.log("Finished crawling.")
  const firstPage: ExtractedPageData | undefined = pages.values().next()?.value as ExtractedPageData | undefined
  if (firstPage) {
    console.log(firstPage)
    console.log(`First page record: ${firstPage.url} - ${firstPage.heading}`)
  }
  writeJSONReport(pages)
  process.exit(0)
}

(async () => {
  await main()
})()
