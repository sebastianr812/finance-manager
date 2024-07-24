import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono"

type ResponseType = InferResponseType<typeof client.api.transactions[":id"]["$patch"]>;
type RequestType = InferRequestType<typeof client.api.transactions[":id"]["$patch"]>["json"];

export function useEditTransaction(id?: string) {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async (json) => {
            const res = await client.api.transactions[":id"]["$patch"]({
                param: { id },
                json,
            });
            return await res.json();
        },
        // invalidates queries with that queryKey casuing them to refetch
        // For most up to date info
        onSuccess: () => {
            toast.success("Transaction updated");
            queryClient.invalidateQueries({ queryKey: ["transaction", { id }] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            // TODO: invalidate queryKey for summary and trasactions casuing them to update / refetch
        },
        onError: () => {
            toast.error("Failed to edit transaction");
        }
    });
    return mutation;
}

