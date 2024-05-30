import { Hono } from "hono"
import { handle } from "hono/vercel"

export const runtime = "edge";

// this makes it so we do not need to handle routes with the url /api everytime
const app = new Hono().basePath("/api")

// we can also create an RPC giving us end to end type safety using a zodValidator
// as a middleware before the route handler
app
    .get("/hello",
        // we can use 3rd party middlewares to protect individual api routes
        // and or send a diff json response -> if we were to do this inside
        // middleware.ts it will just redirect user to root page every time
        // this allows more control for us -> we can also run validators for
        // json, forms, params using zValidator
        (c) => {
        return c.json({
            message: "Hello Next.js!",
        });
    });
// we can also mount routes to handlers using the app.routes() method -> this is
// best practice from hono because it allows the handlers to have context available
// compared to writing seperate handlers where the only way to get context is to use
// generics
// app.routes("/foo", handleFoo (inside another file))

// this overwrites the nextjs api route conventions allowing us to keep all routes
// in this one file instead of file based routing with default nextjs
export const GET = handle(app);
export const POST = handle(app);

