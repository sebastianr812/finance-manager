"use client";

import { EditAccountSheet } from "@/features/accounts/components/EditAccountSheet";
import { NewAccountSheet } from "@/features/accounts/components/NewAccountSheet";
import { useMountedState } from "react-use";

export const SheetProvider = () => {
    const isMounted = useMountedState();

    if (!isMounted) {
        return null;
    }
    return (
        <>
            <NewAccountSheet />
            <EditAccountSheet />
        </>
    );
}

