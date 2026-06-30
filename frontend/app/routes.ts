import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes"

export default [
  layout("routes/app-layout.tsx", [
    index("routes/home.tsx"),
    layout("routes/auth-layout.tsx", [
      route("login", "routes/login.tsx"),
      route("register", "routes/register.tsx"),
    ]),
  ]),
] satisfies RouteConfig
