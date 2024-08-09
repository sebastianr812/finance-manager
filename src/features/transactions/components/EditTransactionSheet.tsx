import {
    Sheet,
    SheetHeader,
    SheetTitle,
    SheetContent,
    SheetDescription,
} from "@/components/ui/sheet";
import { insertTranactionSchema } from "@/db/schema";
import { z } from "zod";
import { useGetTransaction } from "../api/useGetTransaction";
import { useOpenTransaction } from "../hooks/useOpenTransaction";
import { Loader2 } from "lucide-react";
import { useEditTransaction } from "../api/useEditTransaction";
import { useConfirm } from "@/hooks/useConfirm";
import { useDeleteTransaction } from "../api/useDeleteTransaction";
import { TransactionForm } from "./TransactionForm";
import { useGetCategories } from "@/features/categories/api/useGetCategories";
import { useCreateCategory } from "@/features/categories/api/useCreateCategory";
import { useGetAccounts } from "@/features/accounts/api/useGetAccounts";
import { useCreateAccount } from "@/features/accounts/api/useCreateAccount";

const formSchema = insertTranactionSchema.omit({
    id: true
});

type FormValues = z.input<typeof formSchema>;

export const EditTransactionSheet = () => {
    const { isOpen, onClose, id } = useOpenTransaction()

    const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure?",
        "You are about to delete this transaction"
    );

    const transactionQuery = useGetTransaction(id);
    const editMutation = useEditTransaction(id);
    const deleteMutation = useDeleteTransaction(id);

    const categoryQuery = useGetCategories();
    const categoryMutation = useCreateCategory();
    const onCreateCategory = (name: string) => categoryMutation.mutate({ name });

    const categoryOptions = (categoryQuery.data ?? []).map((cat) => ({
        label: cat.name,
        value: cat.id,
    }));

    const accountQuery = useGetAccounts();
    const accountMutation = useCreateAccount();
    const onCreateAccount = (name: string) => accountMutation.mutate({ name });

    const accountOptions = (accountQuery.data ?? []).map((acc) => ({
        label: acc.name,
        value: acc.id,
    }));

    const isPending =
        editMutation.isPending ||
        deleteMutation.isPending ||
        transactionQuery.isLoading ||
        categoryMutation.isPending ||
        accountMutation.isPending;

    const isLoading =
        transactionQuery.isLoading ||
        categoryQuery.isLoading ||
        accountQuery.isLoading;

    const onSubmit = (values: FormValues) => {
        editMutation.mutate(values, {
            onSuccess: () => {
                onClose();
            }
        });
    }

    const defaultValues = transactionQuery.data ? {
        accountId: transactionQuery.data.accountId,
        categoryId: transactionQuery.data.categoryId,
        amount: transactionQuery.data.amount.toString(),
        date: transactionQuery.data.date
            ? new Date(transactionQuery.data.date)
            : new Date(),
        payee: transactionQuery.data.payee,
        notes: transactionQuery.data.notes,
    } : {
        accountId: "",
        categoryId: "",
        amount: "",
        date: new Date(),
        payee: "",
        notes: "",
    }

    const onDelete = async () => {
        const ok = await confirm();

        if (ok) {
            deleteMutation.mutate(undefined, {
                onSuccess: () => {
                    onClose();
                }
            });
        }
    }


    return (
        <>
            <ConfirmDialog />
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="space-y-4">
                    <SheetHeader>
                        <SheetTitle>
                            Edit Transaction
                        </SheetTitle>
                        <SheetDescription>
                            Edit an existing transaction
                        </SheetDescription>
                    </SheetHeader>
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="size-4 text-muted-foreground animate-spin" />
                        </div>
                    ) : (
                        <TransactionForm
                            id={id}
                            defaultValues={defaultValues}
                            onSubmit={onSubmit}
                            disabled={isPending}
                            categoryOptions={categoryOptions}
                            onCreateCategory={onCreateCategory}
                            accountOptions={accountOptions}
                            onCreateAccount={onCreateAccount}
                            onDelete={onDelete}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}

