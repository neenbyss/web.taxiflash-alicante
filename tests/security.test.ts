import assert from "node:assert/strict"
import { test } from "node:test"
import { checkRateLimit } from "../lib/rate-limit"
import { readLimitedBody, readLimitedJson } from "../lib/request-body"

test("rejects oversized bodies without Content-Length", async () => {
  await assert.rejects(
    readLimitedBody(
      new Request("https://example.test", {
        method: "POST",
        body: "x".repeat(2049),
      }),
      2048
    ),
    RangeError
  )
})

test("counts UTF-8 bytes rather than characters", async () => {
  await assert.rejects(
    readLimitedBody(
      new Request("https://example.test", {
        method: "POST",
        body: "á".repeat(1025),
      }),
      2048
    ),
    RangeError
  )
})

test("accepts a valid JSON payload and rejects malformed JSON", async () => {
  assert.deepEqual(
    await readLimitedJson(
      new Request("https://example.test", {
        method: "POST",
        body: '{"code":"123456"}',
      }),
      2048
    ),
    { code: "123456" }
  )
  await assert.rejects(
    readLimitedJson(
      new Request("https://example.test", { method: "POST", body: "{" }),
      2048
    ),
    SyntaxError
  )
})

test("limits requests independently per actor", () => {
  const options = {
    key: "test.actor",
    actor: "one",
    limit: 2,
    windowMs: 60_000,
  }
  assert.equal(checkRateLimit(options).ok, true)
  assert.equal(checkRateLimit(options).ok, true)
  assert.equal(checkRateLimit(options).ok, false)
  assert.equal(checkRateLimit({ ...options, actor: "two" }).ok, true)
})

test("short-window traffic cannot erase long-window limits when capacity is reached", () => {
  const realNow = Date.now
  let now = 1_000_000
  Date.now = () => now
  try {
    const long = { key: "test.long", actor: "one", limit: 1, windowMs: 600_000 }
    assert.equal(checkRateLimit(long).ok, true)
    for (let i = 0; i < 10_000; i++)
      checkRateLimit({
        key: "test.fill",
        actor: String(i),
        limit: 1,
        windowMs: 600_000,
      })
    now += 60_001
    assert.equal(
      checkRateLimit({
        key: "test.short",
        actor: "new",
        limit: 1,
        windowMs: 60_000,
      }).ok,
      false
    )
    assert.equal(checkRateLimit(long).ok, false)
    now += 600_000
    assert.equal(checkRateLimit(long).ok, true)
  } finally {
    Date.now = realNow
  }
})
