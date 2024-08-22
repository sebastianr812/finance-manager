import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

export function useGetSummary() {
    const params = useSearchParams();
    const from = params.get("from") || "";
    const to = params.get("to") || "";
    const accountId = params.get("accountId") || "";

    const query = useQuery({
        // TODO: check if params are needed in the query key
        queryKey: ["summary", { from, to, accountId }],
        queryFn: async () => {
            const res = await client.api.summary.$get({
                query: {
                    to,

                }
            });

            if (!res.ok) {
                throw new Error("failed to fetch summary");
            }

            const { data } = await res.json();
            // this allows all of front end api hooks to become formatted
            // instead of having to call a func on the front end every time
            // to convert api data to front end data
            // this is our MIDDLE layer so we do it here and the entire front
            // end has the correct data foramt
            return {
                ...data,
                incomeAmount: convertAmountFromMiliunits(data.incomeAmount),
                expensesAmount: convertAmountFromMiliunits(data.expensesAmount),
                remainingAmount: convertAmountFromMiliunits(data.remainingAmount),
                categories: data.categories.map((category) => ({
                    ...category,
                    value: convertAmountFromMiliunits(category.value),
                })),
                days: data.days.map((day) => ({
                    ...day,
                    income: convertAmountFromMiliunits(day.income as number),
                    expenses: convertAmountFromMiliunits(day.expenses as number),
                }))
            }
        }
    });
    return query;
}


