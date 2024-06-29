import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogHeader,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";

export function useConfirm(
    title: string,
    msg: string,
): [() => React.JSX.Element, () => Promise<unknown>] {
    const [promise, setPromise] = useState<
        { resolve: (value: boolean) => void } | null>(null);

    const confirm = () => new Promise((resolve, reject) => {
        setPromise({ resolve });
    });

    const handleClose = () => {
        setPromise(null);
    }

    const handleConfirm = () => {
        promise?.resolve(true);
        handleClose();
    }

    const handleCancel = () => {
        promise?.resolve(false);
        handleClose();
    }

    const ConfirmDialog = () => (
        <Dialog open={promise !== null}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {msg}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="pt-2">
                    <Button
                        variant="outline"
                        onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}>
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

    return [ConfirmDialog, confirm]
}

