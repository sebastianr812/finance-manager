import { client } from "@/lib/hono";
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
            return data;
        },
    });
    return query;
}

