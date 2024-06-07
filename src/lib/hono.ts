import { hc } from "hono/client";

import { AppType } from "@/app/api/[[...route]]/route";

// creating front end RPC client to connect the types from back to front
// with the apps URL
export const client = hc<AppType>(process.env.NEXT_PUBLIC_APP_URL!);

