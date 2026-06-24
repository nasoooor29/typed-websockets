export type ClientEvents = {
  "main.CreateUser": {
    name: string
    password: string
  }

  "main.GetUser": {
    name: string
  }
  "main.Ping": {
    ping: string
  }
}

export type ServerEvents = {
  "main.User": {
    name: string
    password: string
  }

  "main.Pong": {
    pong: string
  }

  "main.ErrorResponse": {
    message: string
  }
}

type Envelope<T = unknown> = {
  type: string
  payload: T
}

type Handler<T> = (payload: T) => void

export class TypedSocket<
  Incoming extends Record<string, any>,
  Outgoing extends Record<string, any>,
> {
  private ws: WebSocket
  private handlers = new Map<keyof Incoming, Set<Handler<any>>>()

  constructor(url: string) {
    this.ws = new WebSocket(url)

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data) as Envelope

      const handlers = this.handlers.get(msg.type as keyof Incoming)
      if (!handlers) return

      for (const handler of handlers) {
        handler(msg.payload)
      }
    }
  }

  emit<K extends keyof Outgoing & string>(type: K, payload: Outgoing[K]) {
    this.ws.send(JSON.stringify({ type, payload }))
  }

  on<K extends keyof Incoming & string>(
    type: K,
    handler: Handler<Incoming[K]>
  ) {
    let set = this.handlers.get(type)

    if (!set) {
      set = new Set()
      this.handlers.set(type, set)
    }

    set.add(handler)

    return () => set.delete(handler)
  }

  close() {
    this.ws.close()
  }
}
