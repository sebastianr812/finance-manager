import {
    Sheet,
    SheetHeader,
    SheetTitle,
    SheetContent,
    SheetDescription,
} from "@/components/ui/sheet";
import { AccountForm } from "./AccountForm";
import { insertAccountSchema } from "@/db/schema";
import { z } from "zod";
import { useCreateAccount } from "../api/useCreateAccount";
import { useOpenAccount } from "../hooks/useOpenAccount";
import { useGetAccount } from "../api/useGetAccount";
import { Loader2 } from "lucide-react";

const formSchema = insertAccountSchema.pick({
    name: true,
});

type FormValues = z.input<typeof formSchema>;

export const EditAccountSheet = () => {
    const { isOpen, onClose, id } = useOpenAccount()

    const accountQuery = useGetAccount(id);

    const mutation = useCreateAccount();

    const isLoading = accountQuery.isLoading;

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values, {
            onSuccess: () => {
                onClose();
            }
        });
    }

    const defaultValues = accountQuery.data ? {
        name: accountQuery.data.name,
    } : {
        name: "",
    }


    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="space-y-4">
                <SheetHeader>
                    <SheetTitle>
                        Edit Account
                    </SheetTitle>
                    <SheetDescription>
                        Edit an existing account
                    </SheetDescription>
                </SheetHeader>
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="size-4 text-muted-foreground animate-spin" />
                    </div>
                ): (
                <AccountForm
                    id={id}
                    onSubmit={onSubmit}
                    disabled={mutation.isPending}
                    defaultValues={defaultValues}
                />
                )}
            </SheetContent>
        </Sheet>
    );
}

