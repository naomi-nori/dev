export default function uniqueBy<T extends object, K extends keyof T>(arr: T[], property: K): T[];
