import { Link } from "react-router"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

export default function Home() {
  return (
    <main className="grid min-h-svh place-items-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Typed Sock</CardTitle>
          <CardDescription>
            A simple SQLite-backed account demo with securely hashed passwords.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Button asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/register">Register</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
