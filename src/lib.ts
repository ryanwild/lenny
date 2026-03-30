import { JSDOM } from "jsdom"

export function normalizeURL(url: string): string {
  const urlObject = new URL(url)
  const result = `${urlObject.host}${urlObject.pathname}`.toLowerCase()
  return result.replace(/\/+$/, '')
}

export function getHeadingFromHTML(html: string): string {
  try {
    const dom = new JSDOM(html)
    const doc = dom.window.document
    const heading = doc.querySelector("h1") ?? doc.querySelector("h2")
    return (heading?.textContent ?? "").trim()
  } catch (err) {
    console.error(err)
    return ""
  }
}

export function getFirstParagraphFromHTML(html: string): string {
  try {
    const dom = new JSDOM(html)
    const doc = dom.window.document
    const main = doc.querySelector("main")
    const p = main?.querySelector("p") ?? doc.querySelector("p")
    return (p?.textContent ?? "").trim()
  } catch (err) {
    console.error(err)
    return ""
  }
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
  const urls = []
  try {
    const dom = new JSDOM(html)
    const doc = dom.window.document
    const links = doc.getElementsByTagName("a")
    for (const link of links) {
      let href = link.getAttribute("href")
      if (href) {
        const firstChar = href.slice(0, 1)
        if (firstChar === "/") {
          const base = baseURL.replace(/\/+$/, '')
          href = `${base}${href}`
        }
        urls.push(href)
      }
    }
  } catch (err) {
    console.error(err)
  }
  return urls
}

export function getImagesFromHTML(html: string, baseURL: string): string[] {
  const urls = []
  try {
    const dom = new JSDOM(html)
    const doc = dom.window.document
    const images = doc.querySelectorAll("image, img")
    for (const image of images) {
      let url = image.getAttribute("href") ?? image.getAttribute("src")
      if (url) {
        const firsthChar = url.slice(0, 1)
        if (firsthChar === "/") {
          const base = baseURL.replace(/\/+$/, '')
          url = `${base}${url}`
        }
        urls.push(url)
      }
    }
  } catch (err) {
    console.error(err)
  }
  return urls
}

export type ExtractedPageData = {
  url: string,
  heading: string,
  first_paragraph: string,
  outgoing_links: string[],
  image_urls: string[]
}

export function extractPageData(html: string, pageURL: string): ExtractedPageData {
  const heading = getHeadingFromHTML(html)
  const first_paragraph = getFirstParagraphFromHTML(html)
  const outgoing_links = getURLsFromHTML(html, pageURL)
  const image_urls = getImagesFromHTML(html, pageURL)
  return {
    url: pageURL,
    heading,
    first_paragraph,
    outgoing_links,
    image_urls,
  }
}

export async function getHTML(url: string): Promise<string> {
  let result = ""
  try {
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

    result = await response.text()
  } catch (err) {
    console.error((err as Error).message)
  }
  return result
}

export async function crawlPage(
  baseURL: string,
  currentURL: string = baseURL,
  pages: Record<string, number> = {},
) {
  const currentURLObj = new URL(currentURL)
  const baseURLObj = new URL(baseURL)
  if (currentURLObj.hostname !== baseURLObj.hostname) {
    return pages
  }

  const normalizedURL = normalizeURL(currentURL)

  if (pages[normalizedURL] > 0) {
    pages[normalizedURL]++
    return pages
  }

  pages[normalizedURL] = 1

  console.log(`crawling ${currentURL}`)
  let html = ""
  try {
    html = await getHTML(currentURL)
  } catch (err) {
    console.log(`${(err as Error).message}`)
    return pages
  }

  const nextURLs = getURLsFromHTML(html, baseURL)
  for (const nextURL of nextURLs) {
    pages = await crawlPage(baseURL, nextURL, pages)
  }

  return pages
}
