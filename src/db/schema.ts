import { pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const accounts = pgTable("accounts", {
    id: text("id").primaryKey(),
    plaidId: text("plaid_id"),
    name: text("name").notNull(),
    userId: text("user_id").notNull(),
});

// this is used for api user validation is gives us a schema that we can use to
// validate input / req bodies
export const insertAccountSchema = createInsertSchema(accounts);

