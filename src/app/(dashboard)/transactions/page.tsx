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
import { useState } from "react";
import { UploadButton } from "./UploadButton";
import { ImportCard } from "./ImportCard";
import { transactions as transactionsSchema } from "@/db/schema";
import { useSelectAccount } from "@/features/accounts/hooks/useSelectAccount";
import { toast } from "sonner";
import { useBulkCreateTransactions } from "@/features/transactions/api/useBulkCreateTransactions";

enum VARIANTS {
    LIST = "LIST",
    IMPORT = "IMPORT"
}

const INITAL_IMPORT_RESULTS = {
    data: [],
    errors: [],
    meta: {},
};

export default function TransactionsPage() {
    const [AccountDialog, confirm] = useSelectAccount();
    const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
    const [importResults, setImportResults] = useState(INITAL_IMPORT_RESULTS);

    const newTransactionModal = useNewTransaction();
    const bulkCreateMutation = useBulkCreateTransactions();
    const deleteTransactions = useBulkDeleteTransactions();
    const transactionsQuery = useGetTransactions();
    const transactions = transactionsQuery.data || [];

    const isDisabled = deleteTransactions.isPending || transactionsQuery.isLoading;

    const onUpload = (results: typeof INITAL_IMPORT_RESULTS) => {
        setImportResults(results);
        setVariant(VARIANTS.IMPORT);
    };

    const onCancelImport = () => {
        setImportResults(INITAL_IMPORT_RESULTS);
        setVariant(VARIANTS.LIST);
    };

    const onSubmitImport = async (values: typeof transactionsSchema.$inferInsert[]) => {
        const accountId = await confirm();

        if (!accountId) {
            return toast.error("Please select an account to continue");
        }

        const data = values.map((val) => ({
            ...val,
            accountId: accountId as string,
        }));

        bulkCreateMutation.mutate(data, {
            onSuccess: () => {
                onCancelImport();
            },
        });

    }

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

    if (variant === VARIANTS.IMPORT) {
        return (
            <>
                <AccountDialog />
                <ImportCard
                    data={importResults.data}
                    onCancel={onCancelImport}
                    onSubmit={onSubmitImport}
                />
            </>
        );
    }
    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border-none drop-shadow-sm">
                <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
                    <CardTitle className="text-xl line-clamp-1">
                        Transaction History
                    </CardTitle>
                    <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-x-2">
                        <Button
                            className="w-full lg:w-auto"
                            size="sm"
                            onClick={newTransactionModal.onOpen}>
                            <Plus className="size-4 mr-2" />
                            Add new
                        </Button>
                        <UploadButton
                            onUpload={onUpload}
                        />
                    </div>
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

