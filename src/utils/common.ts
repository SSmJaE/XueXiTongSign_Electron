import dayjs from "dayjs";

export function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T];

export function ObjectEntries<T extends object>(t: T): Entries<T>[] {
    return Object.entries(t) as any;
}

export function formatDate(time: any) {
    return dayjs(time).format("YYYY-MM-DD");
}

export function formatTime(time: any) {
    return dayjs(time).format("HH:mm:ss");
}

export function formatDateTime(time: any) {
    return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
}
