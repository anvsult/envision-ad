export function groupBy<T>(
    array: T[],
    key: (item: T) => string
): Record<string, T[]> {
    return array.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
}, {});
}