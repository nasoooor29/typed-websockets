import z from "zod"
import { createSocketThings } from "./ws"

export * from "./use-mobile"

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
})

export const clientEventSchemas = {
  "user.create": z.object({
    name: z.string(),
    password: z.string(),
  }),
  "user.login": z.object({
    name: z.string(),
    password: z.string(),
  }),
  "user.me": z.object({
    token: z.string(),
  }),
  "user.logout": z.object({
    token: z.string(),
  }),
  "main.ping": z.object({
    ping: z.string(),
  }),
} as const

export const serverEventSchemas = {
  "main.AuthSession": z.object({
    user: userSchema,
    token: z.string(),
  }),
  "main.Me": z.object({
    user: userSchema.nullable(),
  }),
  "main.LoggedOut": z.object({}),
  "main.Pong": z.object({
    pong: z.string(),
  }),
  "main.ErrorResponse": z.object({
    message: z.string(),
  }),
} as const

export const { SocketContext, useSocket, useSocketEvent, SocketProvider } =
  createSocketThings({
    clientEventSchemas: clientEventSchemas,
    serverEventSchemas: serverEventSchemas,
    url: "ws://localhost:8080/ws",
  })
