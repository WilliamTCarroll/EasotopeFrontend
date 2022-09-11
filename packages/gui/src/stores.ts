import { defaultConfig, ColumnConfig, Sample } from "sheet-handle";
import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

/** Static String for the key of an input class */
export const NOTE_CLASS = "__note_class__";
/** Static String for the class that appears on an error field */
export const ERR_CLASS = "error";
/** Get the Column Configuration currently loaded */
export function getColumnConfig(): ColumnConfig {
    return defaultConfig;
}
/** The stored rows of Sample Data */
export let rows: Writable<Sample[]> = writable([]);

/** Check if there are any rows that have an error */
export function checkRowsForErr(data: Sample[]): boolean {
    for (const s of data) {
        for (const r of s.replicates) {
            if (r.Disabled && r.Notes.trim().length === 0) {
                console.log(r);
                return true;
            }
        }
    }

    return false;
}
