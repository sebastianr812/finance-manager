import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Props = {
    columnIndex: number;
    selectedColumns: Record<string, string | null>;
    onChange: (columnIndex: number, value: string | null) => void;
}

export const options = [
    "amount",
    "payee",
    "date",
];

export const TableHeadSelect = ({
    selectedColumns, onChange, columnIndex
}: Props) => {
    const currentSelection = selectedColumns[`column_${columnIndex}`];

    return (
        <Select
            value={currentSelection || ""}
            onValueChange={(value) => onChange(columnIndex, value)}
        >
            <SelectTrigger className={cn(
                "focus:ring-offset-0 focus:ring-transparent outline-none border-none bg-transparent capitalize",
                currentSelection && "text-blue-500",
            )}
            >
                <SelectValue placeholder="Skip" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="skip">
                    Skip
                </SelectItem>
                {options.map((opt, index) => {
                    const disabled = Object.values(selectedColumns)
                        .includes(opt) &&
                        selectedColumns[`column_${columnIndex}`] !== opt;
                    return (
                        <SelectItem
                            key={index}
                            value={opt}
                            disabled={disabled}
                            className="capitalize"
                        >
                            {opt}
                        </SelectItem>
                    )
                })}
            </SelectContent>
        </Select>
    );
}

