export function exclude<Object, Key extends keyof Object>(
    object: Object,
    keys: Key[],
): Omit<Object, Key> {
    for (let key of keys) {
        delete object[key];
    }
    return object;
}

export function addYears(date: Date, years: number): Date {
    date.setFullYear(date.getFullYear() + years);
    return date;
}
