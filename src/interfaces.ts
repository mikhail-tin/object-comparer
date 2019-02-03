interface CompareResult {
    equal: boolean;
    diff: Difference[];
}

interface Difference {
    keyInObjA: string;
    keyInObjB: string;
    valueInObjA: any;
    valueInObjB: any;
    type: DiffType;
}

enum DiffType {
    ADDED,
    REMOVED,
    UPDATED,
    NONE
}

export { DiffType, Difference, CompareResult }