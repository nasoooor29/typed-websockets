import z from "zod"
import { createSocketThings } from "./ws"

export * from "./use-mobile"

export const clientEventSchemas = {
  "user.create": z.object({
    name: z.string(),
    password: z.string(),
  }),
  "user.login": z.object({
    name: z.string(),
    password: z.string(),
  }),
  "main.ping": z.object({
    ping: z.string(),
  }),
} as const

export const serverEventSchemas = {
  "main.User": z.object({
    id: z.number(),
    name: z.string(),
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
