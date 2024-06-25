"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardTitle,
    CardFooter,
    CardHeader,
    CardDescription,
} from "@/components/ui/card";
import { useNewAccount } from "@/features/accounts/hooks/useNewAccount";
import { Plus } from "lucide-react";
import { Payment, columns } from "./columns"
import { DataTable } from "@/components/data-table";


const data: Payment[] = [
    {
        id: "728ed52f",
        amount: 100,
        status: "pending",
        email: "m@example.com",
    },
    {
        id: "728ed52f",
        amount: 200,
        status: "success",
        email: "a@example.com",
    }
    // ...
]

export default function AccountsPage() {

    const newAccount = useNewAccount();
    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border-none drop-shadow-sm">
                <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
                    <CardTitle className="text-xl line-clamp-1">
                        Accounts page!
                    </CardTitle>
                    <Button size="sm" onClick={newAccount.onOpen}>
                        <Plus className="size-4 mr-2" />
                        Add new
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        onDelete={() => {}}
                        filterKey="email"
                        columns={columns}
                        data={data} />
                </CardContent>
            </Card>
        </div>
    );
}

