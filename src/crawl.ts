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
  } catch {
    return "";
  }
}

export function getFirstParagraphFromHTML(html: string): string {
  try {
    const dom = new JSDOM(html)
    const doc = dom.window.document
    const main = doc.querySelector("main")
    const p = main?.querySelector("p") ?? doc.querySelector("p")
    return (p?.textContent ?? "").trim()
  } catch {
    return ""
  }
}
