import {
    Card,
    CardContent,
    CardTitle,
    CardFooter,
    CardHeader,
    CardDescription,
} from "@/components/ui/card";

export default function AccountsPage() {
    return (
        <div>
            <Card className="border-none drop-shadow-sm">
                <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
                    <CardTitle className="text-xl line-clamp-1">
                        Accounts page!
                    </CardTitle>
                </CardHeader>
            </Card>
        </div>
    );
}

