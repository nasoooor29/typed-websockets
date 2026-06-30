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
  "user.me": z.object({}),
  "main.ping": z.object({
    ping: z.string(),
  }),
} as const

export const serverEventSchemas = {
  "main.User": userSchema,
  "main.Me": z.object({
    user: userSchema.nullable(),
  }),
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
