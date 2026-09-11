import assert from "node:assert/strict"
import { test } from "node:test"
import { validateDeploymentEnv } from "../lib/deployment-env"
import { isIndexingAllowed } from "../lib/indexing"

const valid = {
  DATABASE_URL:
    "postgresql://user:fake-password@database.example.com/taxiflash?sslmode=require",
  BETTER_AUTH_SECRET: "a-test-only-secret-with-more-than-thirty-two-characters",
  BETTER_AUTH_URL: "https://demo.example.com",
  NEXT_PUBLIC_APP_URL: "https://demo.example.com",
  BETTER_AUTH_TRUSTED_ORIGINS: "https://demo.example.com",
  TRUSTED_PROXY_HEADER: "x-forwarded-for",
  EMAIL_PROVIDER: "resend",
  RESEND_API_KEY: "re_test_not_a_real_key",
  EMAIL_FROM: "TaxiFlash <taxi@example.com>",
  TARIFA_BASE: "2.50",
  TARIFA_POR_KM: "1.20",
  TARIFA_MINIMA: "4.00",
  SITE_NOINDEX: "true",
}

test("deployment does not require Docker, SMTP or seed variables for Resend", () => {
  assert.deepEqual(validateDeploymentEnv(valid), [])
})
test("rejects local databases, HTTP origins and default credentials", () => {
  const errors = validateDeploymentEnv({
    ...valid,
    DATABASE_URL: "postgresql://user:password@localhost:5433/db",
    BETTER_AUTH_URL: "http://192.168.3.10:3500",
    BETTER_AUTH_SECRET: "cambia-esto",
  })
  for (const key of ["DATABASE_URL", "BETTER_AUTH_URL", "BETTER_AUTH_SECRET"])
    assert.ok(errors.some((error) => error.startsWith(key)))
  assert.ok(!errors.some((error) => error.includes("password@")))
})
test("rejects wildcard origins, disabled email and incomplete OAuth", () => {
  const errors = validateDeploymentEnv({
    ...valid,
    BETTER_AUTH_TRUSTED_ORIGINS: "https://*.vercel.app",
    EMAIL_PROVIDER: "disabled",
    GOOGLE_CLIENT_ID: "test",
  })
  assert.ok(errors.length >= 3)
})
test("preview and demo deployments are not indexable", () => {
  assert.equal(
    isIndexingAllowed({
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      SITE_NOINDEX: "false",
    }),
    false
  )
  assert.equal(
    isIndexingAllowed({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      SITE_NOINDEX: "true",
    }),
    false
  )
  assert.equal(
    isIndexingAllowed({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      SITE_NOINDEX: "false",
    }),
    true
  )
})
