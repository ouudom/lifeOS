import { useEffect, useRef } from "react";
import { UseFormWatch, FieldValues } from "react-hook-form";

interface UseAutosaveOptions<T extends FieldValues> {
    watch: UseFormWatch<T>;
    onSave: (data: T) => Promise<void> | void;
    delay?: number;
    enabled?: boolean;
    exclude?: (keyof T)[];
}

export function useAutosave<T extends FieldValues>({
    watch,
    onSave,
    delay = 2000,
    enabled = true,
    exclude = [],
}: UseAutosaveOptions<T>) {
    const isFirstRun = useRef(true);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        if (!enabled) return;

        const subscription = watch((data) => {
            // Skip the first run (initial form load)
            if (isFirstRun.current) {
                isFirstRun.current = false;
                return;
            }

            // Clear existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Set new timeout for autosave
            timeoutRef.current = setTimeout(async () => {
                try {
                    // Filter out excluded fields
                    const filteredData = { ...data } as T;
                    exclude.forEach((key) => delete filteredData[key]);

                    await onSave(filteredData);
                } catch (error) {
                    console.error("Autosave failed:", error);
                }
            }, delay);
        });

        return () => {
            subscription.unsubscribe();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [watch, onSave, delay, enabled, exclude]);
}
