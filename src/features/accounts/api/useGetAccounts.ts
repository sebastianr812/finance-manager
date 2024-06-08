import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

// use separation of concerns and wrap our query logic in a hook that we can
// simply call in components and handle individual
export function useGetAccounts() {
    const query = useQuery({
        queryKey: ["accounts"],
        queryFn: async () => {
            const res = await client.api.accounts.$get();

            if (!res.ok) {
                throw new Error("failed to fetch accounts");
            }

            const { data } = await res.json();
            return data;
        },
    });
    return query;
}

