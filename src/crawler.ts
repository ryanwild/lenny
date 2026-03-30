import pLimit, { LimitFunction } from 'p-limit'
import { ExtractedPageData, extractPageData, normalizeURL } from './lib'

class Crawler {

  pages: Map<string, ExtractedPageData> = new Map<string, ExtractedPageData>()
  baseUrl: string
  private limit: LimitFunction
  private maxPages: number = 10
  private shouldStop: boolean = false

  constructor(baseUrl: string, concurrency: number = 3, maxPages = this.maxPages) {
    this.baseUrl = baseUrl
    this.maxPages = maxPages
    this.limit = pLimit(concurrency)
  }

  private trackPageVisit(normalizedUrl: string): boolean {
    if (this.pages.size >= this.maxPages) {
      console.log("Reached maximum number of pages to crawl.")
      this.shouldStop = true
      return true
    }
    if (this.pages.has(normalizedUrl)) {
      return true
    }
    return false
  }

  async getHTML(url: string): Promise<string> {
    let result = ""
    try {
      result = await this.limit(async (): Promise<string> => {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "BootCrawler/1.0"
          }
        })
        const contentType = response.headers.get("content-type")
        if (!contentType?.toLowerCase().includes("text/html")) {
          throw new Error(`Invalid content type response, expecting text/html, received: "${contentType}"`)
        }
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`)
        }
        return response.text()
      })
    } catch (err) {
      console.error((err as Error).message)
    }
    return result
  }

  private async crawlPage(
    currentURL: string = this.baseUrl
  ): Promise<Map<string, ExtractedPageData>> {
    if (this.shouldStop) {
      return this.pages
    }
    const normalizedURL = normalizeURL(currentURL)
    if (this.trackPageVisit(normalizedURL)) {
      return this.pages
    }
    const currentURLObj = new URL(currentURL)
    const baseURLObj = new URL(this.baseUrl)
    if (currentURLObj.hostname !== baseURLObj.hostname) {
      return this.pages
    }

    console.log(`crawling ${currentURL}`)
    let html = ""
    try {
      html = await this.getHTML(currentURL)
    } catch (err) {
      console.log(`${(err as Error).message}`)
      return this.pages
    }
    const extracted: ExtractedPageData = extractPageData(html, currentURL)
    this.pages.set(normalizedURL, extracted)

    for (const nextURL of extracted.outgoing_links) {
      this.pages = await this.crawlPage(nextURL)
    }

    return this.pages
  }

  static async crwalSite(
    url: string,
    concurrency: number | undefined,
    maxPages: number | undefined
  ): Promise<Map<string, ExtractedPageData>> {
    const crwaler = new Crawler(url, concurrency, maxPages)
    return crwaler.crawlPage()
  }
}

export default Crawler
