import {
  extractPageData,
  getFirstParagraphFromHTML,
  getHeadingFromHTML,
  getImagesFromHTML,
  getURLsFromHTML,
  normalizeURL,
} from "./lib"

import { expect, test } from "vitest"

test("removes https/http", () => {
  const testInput = [
    ["htps://test.com", "test.com"],
    ["http://test.com", "test.com"],
    ["https://www.test.com", "www.test.com"],
  ]
  for (let input of testInput) {
    const [url, expected] = input
    const result = normalizeURL(url)
    expect(result).toBe(expected)
  }
})

test("getHeadingFromHTML basic", () => {
  const inputBody = `<html><body><h1>Test Title</h1></body></html>`
  const actual = getHeadingFromHTML(inputBody)
  const expected = "Test Title"
  expect(actual).toEqual(expected)
})

test("getHeadingFromHTML h2 fallback", () => {
  const inputBody = `<html><body><h2>Fallback Title</h2></body></html>`
  const actual = getHeadingFromHTML(inputBody)
  const expected = "Fallback Title"
  expect(actual).toEqual(expected)
})

test("getFirstParagraphFromHTML main priority", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <main>
        <p>Main paragraph.</p>
      </main>
    </body></html>`
  const actual = getFirstParagraphFromHTML(inputBody)
  const expected = "Main paragraph."
  expect(actual).toEqual(expected)
})

test("getFirstParagraphFromHTML fallback to first p", () => {
  const inputBody = `
    <html><body>
      <p>First outside paragraph.</p>
      <p>Second outside paragraph.</p>
    </body></html>`
  const actual = getFirstParagraphFromHTML(inputBody)
  const expected = "First outside paragraph."
  expect(actual).toEqual(expected)
})

test("getFirstParagraphFromHTML no paragraphs", () => {
  const inputBody = `<html><body><h1>Title</h1></body></html>`
  const actual = getFirstParagraphFromHTML(inputBody)
  const expected = ""
  expect(actual).toEqual(expected)
})

test("getURLsFromHTML absolute", () => {
  const inputURL = "https://crawler-test.com"
  const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span></a></body></html>`

  const actual = getURLsFromHTML(inputBody, inputURL)
  const expected = ["https://crawler-test.com/path/one"]

  expect(actual).toEqual(expected)
})

test("getImagesFromHTML relative", () => {
  const inputURL = "https://crawler-test.com"
  const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`

  const actual = getImagesFromHTML(inputBody, inputURL)
  const expected = ["https://crawler-test.com/logo.png"]

  expect(actual).toEqual(expected)
})

test("extractPageData basic", () => {
  const inputURL = "https://crawler-test.com"
  const inputBody = `
    <html><body>
      <h1>Test Title</h1>
      <p>This is the first paragraph.</p>
      <a href="/link1">Link 1</a>
      <img src="/image1.jpg" alt="Image 1">
    </body></html>
  `

  const actual = extractPageData(inputBody, inputURL)
  const expected = {
    url: "https://crawler-test.com",
    heading: "Test Title",
    first_paragraph: "This is the first paragraph.",
    outgoing_links: ["https://crawler-test.com/link1"],
    image_urls: ["https://crawler-test.com/image1.jpg"],
  }

  expect(actual).toEqual(expected)
})
