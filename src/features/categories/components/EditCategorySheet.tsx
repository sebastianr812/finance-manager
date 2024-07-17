import {
    Sheet,
    SheetHeader,
    SheetTitle,
    SheetContent,
    SheetDescription,
} from "@/components/ui/sheet";
import { CategoryForm } from "./CategoryForm";
import { insertCategorySchema } from "@/db/schema";
import { z } from "zod";
import { useGetCategory } from "@/features/categories/api/useGetCategory"
import { Loader2 } from "lucide-react";
import { useEditCategory } from "../../categories/api/useEditCategory";
import { useDeleteCategory } from "../../categories/api/useDeleteCategory";
import { useConfirm } from "@/hooks/useConfirm";
import { useOpenCategory } from "../hooks/useOpenCategory";

const formSchema = insertCategorySchema.pick({
    name: true,
});

type FormValues = z.input<typeof formSchema>;

export const EditCategorySheet = () => {
    const { isOpen, onClose, id } = useOpenCategory()
    const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure?",
        "You are about to delete this category"
    );

    const categoryQuery = useGetCategory(id);

    const editMutation = useEditCategory(id);
    const deleteMutation = useDeleteCategory(id);

    const isPending =
        editMutation.isPending ||
        deleteMutation.isPending;

    const isLoading = categoryQuery.isLoading;

    const onSubmit = (values: FormValues) => {
        editMutation.mutate(values, {
            onSuccess: () => {
                onClose();
            }
        });
    }

    const defaultValues = categoryQuery.data ? {
        name: categoryQuery.data.name,
    } : {
        name: "",
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
                            Edit category
                        </SheetTitle>
                        <SheetDescription>
                            Edit an existing category
                        </SheetDescription>
                    </SheetHeader>
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="size-4 text-muted-foreground animate-spin" />
                        </div>
                    ) : (
                        <CategoryForm
                            id={id}
                            onSubmit={onSubmit}
                            disabled={isPending}
                            defaultValues={defaultValues}
                            onDelete={onDelete}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}

