import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export function useGetAccounts() {
    const query = useQuery({
        queryKey: ["accounts"],
        queryFn: async () => {
            const res = await client.api.accounts.$get();
        }),
    });
}

