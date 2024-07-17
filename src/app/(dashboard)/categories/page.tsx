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
import { Skeleton } from "@/components/ui/skeleton";
import { useNewCategory } from "@/features/categories/hooks/useNewCategory";
import { useBulkDeleteCategories } from "@/features/categories/api/useBulkDeleteCategories";
import { useGetCategories } from "@/features/categories/api/useGetCategories";

export default function CategoriesPage() {
    const newCategoryModal = useNewCategory();
    const deleteCategories = useBulkDeleteCategories();
    const categoriesQuery = useGetCategories();
    const categories = categoriesQuery.data || [];

    const isDisabled = deleteCategories.isPending || categoriesQuery.isLoading;

    if (categoriesQuery.isLoading) {
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
                        Categories page
                    </CardTitle>
                    <Button size="sm" onClick={newCategoryModal.onOpen}>
                        <Plus className="size-4 mr-2" />
                        Add new
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        disabled={isDisabled}
                        onDelete={(row) => {
                            const ids = row.map((r) => r.original.id);
                            deleteCategories.mutate({ ids });

                        }}
                        filterKey="name"
                        columns={columns}
                        data={categories} />
                </CardContent>
            </Card>
        </div>
    );
}

