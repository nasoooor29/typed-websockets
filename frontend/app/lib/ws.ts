import { toast } from "sonner"
import { z } from "zod"

export const clientEventSchemas = {
  "main.CreateUser": z.object({
    name: z.string(),
    password: z.string(),
  }),
  "main.GetUser": z.object({
    name: z.string(),
  }),
  "main.Ping": z.object({
    ping: z.string(),
  }),
} as const

export const serverEventSchemas = {
  "main.User": z.object({
    name: z.string(),
    password: z.string(),
  }),
  "main.Pong": z.object({
    pong: z.string(),
  }),
  "main.ErrorResponse": z.object({
    message: z.string(),
  }),
} as const

type SchemaMap = Record<string, z.ZodTypeAny>

type EventsFromSchemas<TSchemas extends SchemaMap> = {
  [K in keyof TSchemas]: z.infer<TSchemas[K]>
}

export type ClientEvents = EventsFromSchemas<typeof clientEventSchemas>
export type ServerEvents = EventsFromSchemas<typeof serverEventSchemas>

const envelopeSchema = z.object({
  type: z.string(),
  payload: z.unknown(),
})

type Handler<T> = (payload: T) => void

export class TypedSocket<
  IncomingSchemas extends SchemaMap,
  OutgoingSchemas extends SchemaMap,
> {
  private ws: WebSocket
  private handlers = new Map<
    keyof EventsFromSchemas<IncomingSchemas>,
    Set<Handler<unknown>>
  >()

  constructor(
    url: string,
    private incomingSchemas: IncomingSchemas,
    private outgoingSchemas: OutgoingSchemas
  ) {
    this.ws = new WebSocket(url)

    this.ws.onmessage = (event) => {
      try {
        const parsedJson = JSON.parse(event.data)
        const envelope = envelopeSchema.parse(parsedJson)

        const schema = this.incomingSchemas[
          envelope.type as keyof IncomingSchemas
        ]
        if (!schema) {
          toast.error(`Unknown websocket event: ${envelope.type}`)
          return
        }

        const payload = schema.parse(envelope.payload)
        const handlers = this.handlers.get(
          envelope.type as keyof EventsFromSchemas<IncomingSchemas>
        )
        if (!handlers) return

        for (const handler of handlers) {
          handler(payload)
        }
      } catch (error) {
        console.error("[typed-socket] invalid websocket message", error)
      }
    }
  }

  emit<K extends keyof EventsFromSchemas<OutgoingSchemas> & string>(
    type: K,
    payload: EventsFromSchemas<OutgoingSchemas>[K]
  ) {
    const schema = this.outgoingSchemas[type]
    const validatedPayload = schema.parse(payload)

    this.ws.send(JSON.stringify({ type, payload: validatedPayload }))
  }

  on<K extends keyof EventsFromSchemas<IncomingSchemas> & string>(
    type: K,
    handler: Handler<EventsFromSchemas<IncomingSchemas>[K]>
  ) {
    let set = this.handlers.get(type)

    if (!set) {
      set = new Set()
      this.handlers.set(type, set)
    }

    set.add(handler as Handler<unknown>)

    return () => {
      set.delete(handler as Handler<unknown>)
    }
  }

  close() {
    this.ws.close()
  }
}
