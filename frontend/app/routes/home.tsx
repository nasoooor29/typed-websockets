import { useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { useSocket, useSocketEvent } from "~/hooks"

export default function Home() {
  const socket = useSocket()
  const [message, setMessage] = useState("")
  const [pong, setPong] = useState("")

  useSocketEvent("main.Pong", ({ pong: response }) => {
    setPong(response)
    toast.success("Pong received")
  })
  useSocketEvent("main.ErrorResponse", ({ message: error }) => {
    toast.error(error)
  })

  return (
    <main className="grid min-h-svh place-items-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Ping pong</CardTitle>
          <CardDescription>
            Send a message over your authenticated websocket connection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Say ping..."
            />
          </div>
          {pong && (
            <p className="rounded-md bg-muted p-3 text-sm">
              Pong: <span className="font-medium">{pong}</span>
            </p>
          )}
        </CardContent>
        <CardFooter className="mt-6 flex-col gap-3">
          <Button
            className="w-full"
            onClick={() => socket.emit("main.ping", { ping: message })}
          >
            Send ping
          </Button>
          <p className="text-sm text-muted-foreground">
            Need an account?{" "}
            <Link
              className="font-medium text-primary hover:underline"
              to="/login"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}
