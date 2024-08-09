import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono"

type ResponseType = InferResponseType<typeof client.api.categories[":id"]["$patch"]>;
type RequestType = InferRequestType<typeof client.api.categories[":id"]["$patch"]>["json"];

export function useEditCategory(id?: string) {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async (json) => {
            const res = await client.api.categories[":id"]["$patch"]({
                param: { id },
                json,
            });
            return await res.json();
        },
        // invalidates queries with that queryKey casuing them to refetch
        // For most up to date info
        onSuccess: () => {
            toast.success("Category updated");
            queryClient.invalidateQueries({ queryKey: ["category", { id }] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            // TODO: invalidate queryKey for summary
        },
        onError: () => {
            toast.error("Failed to edit category");
        }
    });
    return mutation;
}

