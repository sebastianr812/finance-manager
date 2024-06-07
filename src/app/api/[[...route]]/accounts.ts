import { db } from "@/db/drizzle";
import { accounts } from "@/db/schema";
import { Hono } from "hono";

// const app = new Hono();

// REGULAR HONO API
//    app.get("/", (c) => {
//        return c.json({ accounts: [] });
//    });
//
//  RPC ALLOWS US TO GET END TO END TYPESAFETY WITH REACT QUERY
//  WE CAN KNOW EXACTLY WHAT TYPE TO EXPECT FROM BACKEND
const app = new Hono()
    .get("/", async (c) => {
        const data = await db
            .select({
                id: accounts.id,
                name: accounts.name
            })
            .from(accounts);

        return c.json({ data });
    });

export default app;

