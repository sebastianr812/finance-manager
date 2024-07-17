import { toast } from "sonner";
import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono"

type ResponseType = InferResponseType<typeof client.api.accounts[":id"]["$delete"]>;

export function useDeleteAccount(id?: string) {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error
    >({
        mutationFn: async () => {
            const res = await client.api.accounts[":id"]["$delete"]({
                param: { id },
            });
            return await res.json();
        },
        // invalidates queries with that queryKey casuing them to refetch
        // For most up to date info
        onSuccess: () => {
            toast.success("Account deleted");
            queryClient.invalidateQueries({ queryKey: ["account", { id }] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            // TODO: invalidate queryKey for summary and trasactions casuing them to update / refetch
        },
        onError: () => {
            toast.error("Failed to delete account");
        }
    });
    return mutation;
}

