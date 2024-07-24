import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono"

type ResponseType = InferResponseType<typeof client.api.transactions.$post>;
type RequestType = InferRequestType<typeof client.api.transactions.$post>["json"];

export function useCreateTransaction() {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async (json) => {
            const res = await client.api.transactions.$post({ json });
            return await res.json();
        },
        // invalidates queries with that queryKey casuing them to refetch
        // For most up to date info
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            toast.success("Transaction created");
            //TODO: invalidate summary
        },
        onError: () => {
            toast.error("Failed to create transaction");
        }
    });
    return mutation;
}
