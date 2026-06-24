import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { useSocket, useSocketEvent } from "~/hooks"

export default function Home() {
  const s = useSocket()
  useSocketEvent("main.Pong", (p) => {
    toast.success(`Pong received: ${p.pong}`)
  })
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <Button
            variant="link"
            className="p-0 text-sm"
            onClick={() => {
              s.emit("main.Ping", { ping: "Ping!" })
            }}
          >
            <span className="text-muted-foreground">Welcome to</span>{" "}
            <span className="font-medium text-foreground">Typed Sock</span>
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button className="mt-2">Button</Button>
        </div>
      </div>
    </div>
  )
}
