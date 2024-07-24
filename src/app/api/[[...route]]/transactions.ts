import { db } from "@/db/drizzle";
import { createId } from "@paralleldrive/cuid2";
import { parse, subDays } from "date-fns";
import { transactions, insertTranactionSchema, categories, accounts } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { and, eq, inArray, lte, gte, desc, sql } from "drizzle-orm";
import { z } from "zod";

const app = new Hono()
    .get(
        "/",
        zValidator("query", z.object({
            from: z.string().optional(),
            to: z.string().optional(),
            accountId: z.string().optional(),
        })),
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
            const { from, to, accountId } = c.req.valid("query");

            const defaultTo = new Date();
            const defaultFrom = subDays(defaultTo, 30);

            const startDate = from
                ? parse(from, "yyyy-MM-dd", new Date())
                : defaultFrom;

            const endDate = to
                ? parse(to, "yyyy-MM-dd", new Date())
                : defaultTo;

            if (!auth?.userId) {
                return c.json({ error: "unauthorized" }, 401);
            }

            const data = await db
                .select({
                    id: transactions.id,
                    date: transactions.date,
                    category: categories.name,
                    categoryId: transactions.categoryId,
                    payee: transactions.payee,
                    amount: transactions.amount,
                    notes: transactions.notes,
                    accountId: transactions.accountId,
                    account: accounts.name,
                })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .leftJoin(categories, eq(transactions.categoryId, categories.id))
                .where(
                    and(
                        accountId ? eq(transactions.accountId, accountId) : undefined,
                        eq(accounts.userId, auth.userId),
                        gte(transactions.date, startDate),
                        lte(transactions.date, endDate),
                    )
                )
                .orderBy(desc(transactions.date));

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
                    id: transactions.id,
                    date: transactions.date,
                    categoryId: transactions.categoryId,
                    payee: transactions.payee,
                    amount: transactions.amount,
                    notes: transactions.notes,
                    accountId: transactions.accountId,
                })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .where(
                    and(
                        eq(accounts.userId, auth.userId),
                        eq(transactions.id, id)
                    )
                )
            if (!data) {
                return c.json({ error: "no data found" }, 404);
            }

            return c.json({ data });
        }

    )
    .post(
        "/",
        clerkMiddleware(),
        zValidator("json", insertTranactionSchema.omit({
            id: true
        })),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "unauthorized" }, 401);
            }

            // select by default returns array of objs from db
            // but insert we need to manually tell it to return - good practice -
            const [data] = await db.insert(transactions).values({
                id: createId(),
                ...values,
            }).returning();
            return c.json({ data });
        })
    .post(
        "/bulk-create",
        clerkMiddleware(),
        zValidator("json", z.array(insertTranactionSchema.omit({ id: true }))),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "unauthorized" }, 401);
            }

            const data = await db
                .insert(transactions)
                .values(
                    values.map((val) => ({
                        id: createId(),
                        ...val,
                    }))
                )
                .returning()

            if (!data) {
                return c.json({
                    error: "could not bulk create"
                });
            }
            return c.json({ data });
        }
    )

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

            const transactionsToDelete = db.$with("transactions_to_delete").as(
                db.select({ id: transactions.id })
                    .from(transactions)
                    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                    .where(
                        and(
                            inArray(transactions.id, values.ids),
                            eq(accounts.userId, auth.userId)
                        )
                    )
            )
            // using the with keyword allows us to combine a sub query
            // making the logic for a complex query easier
            const data = await db
                .with(transactionsToDelete)
                .delete(transactions)
                .where(
                    inArray(transactions.id, sql`
                        (select id from ${transactionsToDelete})
                    `)
                )
                .returning({
                    id: transactions.id
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
        zValidator("json", insertTranactionSchema.omit({
            id: true,
        })),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");
            const values = c.req.valid("json");

            if (!id) {
                return c.json({ error: "missing id" }, 400);
            }

            if (!auth?.userId) {
                return c.json({ error: "unauthorized" }, 401);
            }

            const transactionToUpdate = db.$with("transaction_to_update").as(
                db.select({ id: transactions.id })
                    .from(transactions)
                    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                    .where(
                        and(
                            eq(transactions.id, id),
                            eq(accounts.userId, auth.userId)
                        )
                    )
            )
            const [data] = await db
                .with(transactionToUpdate)
                .update(transactions)
                .set(values)
                .where(
                    inArray(transactions.id, sql`(select id from ${transactionToUpdate})`)
                )
                .returning()

            if (!data) {
                return c.json({ error: "no record found" }, 404);
            }

            return c.json({ data });
        }
    )
    .delete(
        "/:id",
        clerkMiddleware(),
        zValidator("param", z.object({
            id: z.string().optional(),
        })),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            if (!id) {
                return c.json({ error: "missing id" }, 400);
            }

            if (!auth?.userId) {
                return c.json({ error: "unauthorized" }, 401);
            }

            const transactionToDelete = db.$with("transaction_to_delete").as(
                db.select({ id: transactions.id })
                    .from(transactions)
                    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                    .where(
                        and(
                            eq(transactions.id, id),
                            eq(accounts.userId, auth.userId)
                        )
                    )
            )

            const [data] = await db
                .with(transactionToDelete)
                .delete(transactions)
                .where(
                    inArray(transactions.id, sql`(select id from ${transactionToDelete})`)
                )
                .returning({
                    id: transactions.id
                });

            if (!data) {
                return c.json({ error: "no record found" }, 404);
            }

            return c.json({ data });
        }
    )

export default app;

