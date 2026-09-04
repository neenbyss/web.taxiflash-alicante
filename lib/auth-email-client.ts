"use client"

import { emailOTPClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

// Cliente separado para que el plugin OTP no aumente el JavaScript de todos
// los componentes que únicamente consultan la sesión.
export const emailAuthClient = createAuthClient({ plugins: [emailOTPClient()] })
