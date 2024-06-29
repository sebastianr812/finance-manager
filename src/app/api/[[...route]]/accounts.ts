import { db } from "@/db/drizzle";
import { createId } from "@paralleldrive/cuid2";
import { accounts, insertAccountSchema } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { and, eq, inArray } from "drizzle-orm";
import * as z from "zod";

// const app = new Hono();

// REGULAR HONO API
//    app.get("/", (c) => {
//        return c.json({ accounts: [] });
//    });
//
//  RPC ALLOWS US TO GET END TO END TYPESAFETY WITH REACT QUERY
//  WE CAN KNOW EXACTLY WHAT TYPE TO EXPECT FROM BACKEND
const app = new Hono()
    .get(
        "/",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) {
                return c.json({ error: "unauthorized" }, 401);
            }

            const data = await db
                .select({
                    id: accounts.id,
                    name: accounts.name
                })
                .from(accounts)
                .where(eq(accounts.userId, auth.userId));


            return c.json({ data });
        })

    .get(
        "/:id",
        zValidator("param", z.object({
            id: z.string().optional()
        })),
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            if (!id) {
                return c.json({ error: "missing id" }, 400);
            }

            if (!auth?.userId) {
                return c.json({ error: "unauthorized" }, 401);
            }

            const [data] = await db
                .select({
                    id: accounts.id,
                    name: accounts.name
                })
                .from(accounts)
                .where(
                    and(
                        eq(accounts.userId, auth.userId),
                        eq(accounts.id, id)
                    )
                )
            if (!data) {
                return c.json({ error: "no data found" }, 404);
            }

            return c.json({ data });
        }

    )
    // we need to validate what kind of json this post req can accept so we
    // chain middlewares - we created the generic schema and then refined it,
    // we ONLY want the name field to come over the wire, everything else will
    // be inserted from the server (id, userId, plaidId, sensitive info etc)
    .post(
        "/",
        clerkMiddleware(),
        zValidator("json", insertAccountSchema.pick({
            name: true,
        })),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "unauthorized" }, 401);
            }

            // select by default returns array of objs from db
            // but insert we need to manually tell it to return - good practice -
            const [data] = await db.insert(accounts).values({
                id: createId(),
                userId: auth.userId,
                ...values,
            }).returning({
                name: accounts.name,
            });
            return c.json({ data });
        })
    .post(
        "/bulk-delete",
        clerkMiddleware(),
        zValidator(
            "json",
            z.object({
                ids: z.array(z.string())
            })
        ),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "unauthorized" }, 401);
            }

            const data = await db
                .delete(accounts)
                .where(
                    and(
                        eq(accounts.userId, auth.userId),
                        inArray(accounts.id, values.ids)
                    )
                )
                .returning({
                    id: accounts.id
                });


            return c.json({ data });
        }
    )
    .patch(
        "/:id",
        clerkMiddleware(),
        zValidator("param", z.object({
            id: z.string().optional(),
        })),
        zValidator("json", insertAccountSchema.pick({
            name: true
        })),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            // TODO: do the api call to edit the record
        }
    )

export default app;

