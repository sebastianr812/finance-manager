import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export function useGetAccount(id?: string) {
    const query = useQuery({
        enabled: !!id,
        queryKey: ["account", { id }],
        queryFn: async () => {
            const res = await client.api.accounts[":id"].$get({ param: { id } });

            if (!res.ok) {
                throw new Error("failed to fetch account");
            }

            const { data } = await res.json();
            return data;
        },
    });
    return query;
}

