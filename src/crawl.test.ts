import {
  normalizeURL,
  getHeadingFromHTML,
  getFirstParagraphFromHTML,
} from "./crawl"

import { test, expect } from "vitest"

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
