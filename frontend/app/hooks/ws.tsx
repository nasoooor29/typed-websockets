import { createContext, useContext, useEffect, useMemo, useRef } from "react"
import { toast } from "sonner"
import { z } from "zod"

type SchemaMap = Record<string, z.ZodTypeAny>

type EventsFromSchemas<TSchemas extends SchemaMap> = {
  [K in keyof TSchemas]: z.infer<TSchemas[K]>
}

type Handler<T> = (payload: T) => void

type HandlerSet<TEvents extends Record<PropertyKey, unknown>> = Set<
  Handler<TEvents[keyof TEvents]>
>

const envelopeSchema = z.object({
  type: z.string(),
  payload: z.unknown(),
})

export class TypedSocket<
  IncomingSchemas extends SchemaMap,
  OutgoingSchemas extends SchemaMap,
> {
  private ws: WebSocket
  private handlers = new Map<
    keyof EventsFromSchemas<IncomingSchemas>,
    HandlerSet<EventsFromSchemas<IncomingSchemas>>
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

        const schema =
          this.incomingSchemas[envelope.type as keyof IncomingSchemas]
        if (!schema) {
          toast.error(`Unknown websocket event: ${envelope.type}`)
          return
        }

        const payload = schema.parse(envelope.payload)
        const type = envelope.type as keyof EventsFromSchemas<IncomingSchemas>
        const handlers = this.handlers.get(type)
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

    const message = JSON.stringify({ type, payload: validatedPayload })
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message)
      return
    }

    this.ws.addEventListener("open", () => this.ws.send(message), {
      once: true,
    })
  }

  on<K extends keyof EventsFromSchemas<IncomingSchemas> & string>(
    type: K,
    handler: Handler<EventsFromSchemas<IncomingSchemas>[K]>
  ) {
    let set = this.handlers.get(type) as
      | Set<Handler<EventsFromSchemas<IncomingSchemas>[K]>>
      | undefined

    if (!set) {
      set = new Set<Handler<EventsFromSchemas<IncomingSchemas>[K]>>()
      this.handlers.set(
        type,
        set as HandlerSet<EventsFromSchemas<IncomingSchemas>>
      )
    }

    set.add(handler)

    return () => {
      set.delete(handler)
    }
  }

  closeWhen(shouldClose: () => boolean) {
    const closeIfUnused = () => {
      queueMicrotask(() => {
        if (shouldClose() && this.ws.readyState < WebSocket.CLOSING) {
          this.ws.close()
        }
      })
    }

    if (this.ws.readyState === WebSocket.CONNECTING) {
      this.ws.addEventListener("open", closeIfUnused, { once: true })
      return
    }

    closeIfUnused()
  }
}

export function createSocketThings<
  TServerEventSchemas extends Record<string, z.ZodTypeAny>,
  TClientEventSchemas extends Record<string, z.ZodTypeAny>,
>(props: {
  url: string
  serverEventSchemas: TServerEventSchemas
  clientEventSchemas: TClientEventSchemas
}) {
  const SocketContext = createContext<TypedSocket<
    TServerEventSchemas,
    TClientEventSchemas
  > | null>(null)

  const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const mounted = useRef(false)

    const socket = useMemo(() => {
      return new TypedSocket(
        props.url,
        props.serverEventSchemas,
        props.clientEventSchemas
      )
    }, [])

    useEffect(() => {
      mounted.current = true

      return () => {
        mounted.current = false
        socket.closeWhen(() => !mounted.current)
      }
    }, [socket])
    return (
      <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
    )
  }

  const useSocket = () => {
    const socket = useContext(SocketContext)

    if (!socket) {
      throw new Error("useSocket must be used inside SocketProvider")
    }

    return socket
  }

  const useSocketEvent = <K extends keyof TServerEventSchemas & string>(
    event: K,
    handler: (payload: z.infer<TServerEventSchemas[K]>) => void
  ) => {
    const socket = useSocket()

    useEffect(() => {
      const unsubscribe = socket.on(event, handler)
      return () => {
        unsubscribe()
      }
    }, [socket, event, handler])
  }

  return {
    SocketContext,
    useSocket,
    useSocketEvent,
    SocketProvider,
  }
}

