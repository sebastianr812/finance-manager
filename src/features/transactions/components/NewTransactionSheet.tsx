import {
    Sheet,
    SheetHeader,
    SheetTitle,
    SheetContent,
    SheetDescription,
} from "@/components/ui/sheet";
import { z } from "zod";
import { insertTranactionSchema } from "@/db/schema";
import { useNewTransaction } from "../hooks/useNewTransaction";
import { useCreateTransaction } from "../api/useCreateTransaction";
import { useCreateCategory } from "@/features/categories/api/useCreateCategory";
import { useGetCategories } from "@/features/categories/api/useGetCategories";
import { useGetAccounts } from "@/features/accounts/api/useGetAccounts";
import { useCreateAccount } from "@/features/accounts/api/useCreateAccount";
import { TransactionForm } from "./TransactionForm";
import { Loader2 } from "lucide-react";

const formSchema = insertTranactionSchema.omit({
    id: true,
});

type FormValues = z.input<typeof formSchema>;

export const NewTransactionSheet = () => {
    const { isOpen, onClose } = useNewTransaction();
    const createMutation = useCreateTransaction();

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

    const onSubmit = (values: FormValues) => {
        createMutation.mutate(values, {
            onSuccess: () => {
                onClose();
            }
        });
    }

    // this will disable the form (avoids spamming api)
    const isPending = createMutation.isPending
        || accountMutation.isPending
        || categoryMutation.isPending;

    // this will NOT show form (data is being laoded)
    const isLoading = categoryQuery.isLoading
        || accountQuery.isLoading;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="space-y-4">
                <SheetHeader>
                    <SheetTitle>
                        New Transaction
                    </SheetTitle>
                    <SheetDescription>
                        Add a new transaction
                    </SheetDescription>
                </SheetHeader>
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="size-4 text-muted-foreground animate-spin" />
                    </div>
                ) : (
                    <TransactionForm
                        onSubmit={onSubmit}
                        disabled={isPending}
                        categoryOptions={categoryOptions}
                        onCreateCategory={onCreateCategory}
                        accountOptions={accountOptions}
                        onCreateAccount={onCreateAccount}
                    />
                )}
            </SheetContent>
        </Sheet>
    );
}

