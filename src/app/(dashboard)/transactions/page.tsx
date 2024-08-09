"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardTitle,
    CardHeader,
} from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { columns } from "./columns"
import { DataTable } from "@/components/data-table";
import { useGetTransactions } from "@/features/transactions/api/useGetTransactions";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewTransaction } from "@/features/transactions/hooks/useNewTransaction";
import { useBulkDeleteTransactions } from "@/features/transactions/api/useBulkDeleteTransactions";

export default function TransactionsPage() {
    const newTransactionModal = useNewTransaction();
    const deleteTransactions = useBulkDeleteTransactions();
    const transactionsQuery = useGetTransactions();
    const transactions = transactionsQuery.data || [];

    const isDisabled = deleteTransactions.isPending || transactionsQuery.isLoading;

    if (transactionsQuery.isLoading) {
        return (
            <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
                <Card className="border-none drop-shadow-sm">
                    <CardHeader>
                        <Skeleton
                            className="h-8 w-48"
                        />
                    </CardHeader>
                    <CardContent>
                        <div className="h-[500px] w-full flex items-center justify-center">
                            <Loader2 className="size-6 text-slate-300 animate-spin" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border-none drop-shadow-sm">
                <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
                    <CardTitle className="text-xl line-clamp-1">
                        Transaction History
                    </CardTitle>
                    <Button size="sm" onClick={newTransactionModal.onOpen}>
                        <Plus className="size-4 mr-2" />
                        Add new
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        disabled={isDisabled}
                        onDelete={(row) => {
                            const ids = row.map((r) => r.original.id);
                            deleteTransactions.mutate({ ids });

                        }}
                        filterKey="payee"
                        columns={columns}
                        data={transactions} />
                </CardContent>
            </Card>
        </div>
    );
}

