"use client";

import { useGetSummary } from "@/features/summary/api/useGetSummary";
import { formatDateRange } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

export const DataGrid = () => {
    const { data } = useGetSummary();
    console.log("DATA", data);
    const params = useSearchParams();
    const to = params.get("to") || undefined;
    const from = params.get("from") || undefined;

    const dateRangeLabel = formatDateRange({ from, to });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
            <DataCard
                title="Remaining"
                value={data?.remainingAmount}
                percentageChange={data?.remainingChange}
                icon={FaPiggBank}
            />
        </div>
    );
}

