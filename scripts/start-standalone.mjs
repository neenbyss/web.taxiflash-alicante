import "dotenv/config"

process.env.PORT ||= "3500"
process.env.HOSTNAME ||= "0.0.0.0"

await import("../.next/standalone/server.js")
