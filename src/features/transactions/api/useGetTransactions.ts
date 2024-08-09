import { transactions } from "@/db/schema";
import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

export function useGetTransactions() {
    const params = useSearchParams();
    const from = params.get("from") || "";
    const to = params.get("to") || "";
    const accountId = params.get("accountId") || "";

    const query = useQuery({
        // TODO: check if params are needed in the query key
        queryKey: ["transactions", { from , to, accountId }],
        queryFn: async () => {
            const res = await client.api.transactions.$get({
                query: {
                    to,
                    from,
                    accountId,
                }
            });

            if (!res.ok) {
                throw new Error("failed to fetch transactions");
            }

            const { data } = await res.json();
            // this allows all of front end api hooks to become formatted
            // instead of having to call a func on the front end every time
            // to convert api data to front end data
            // this is our MIDDLE layer so we do it here and the entire front
            // end has the correct data foramt
            return data.map((transaction) => ({
                ...transaction,
                amount: convertAmountFromMiliunits(transaction.amount)
            }))
        },
    });
    return query;
}

