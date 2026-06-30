import { type FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router"
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

export default function Register() {
  const socket = useSocket()
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")

  useSocketEvent("main.ErrorResponse", ({ message }) => toast.error(message))
  useSocketEvent("main.User", () => {
    toast.success("Account created.")
    navigate("/")
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    socket.emit("user.create", { name, password })
  }

  return (
    <main className="grid min-h-svh place-items-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <form onSubmit={submit}>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>
              Choose a username and a password of at least 6 characters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Username</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="mt-6 flex-col gap-3">
            <Button className="w-full" type="submit">
              Register
            </Button>
            <p className="text-sm text-muted-foreground">
              Already registered?{" "}
              <Link
                className="font-medium text-primary hover:underline"
                to="/login"
              >
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
