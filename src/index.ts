interface CompareResult {
    equal: boolean;
    diff: Difference[];
}

interface Difference {
    key: string;
    valueInObjA: any;
    valueInObjB: any;
    type: DiffType;
}

enum DiffType {
    ADDED,
    REMOVED,
    UPDATED
}

const isObject = (val) => typeof(val) == 'object';
const isArray = Array.isArray;
const isUndefined = (val) => val === undefined;

const sortByValues = (a: any, b: any): number => {
    var ja = isObject(a) ? JSON.stringify(flatten(a)) : JSON.stringify(a)
    var jb = isObject(b) ? JSON.stringify(flatten(b)) : JSON.stringify(b)

    return Number((ja > jb)) - Number((ja < jb));
};

const nestElement = (previousValue :any, currentValue :any, key: string, prefix = '') => {
    return currentValue && isObject(currentValue)
        ? { ...previousValue, ...flatten(currentValue, `${prefix}${key}.`) }
        : { ...previousValue, ...{ [`${prefix}${key}`]: currentValue } };
};

function flatten(objectOrArray, prefix = ''): any {
    if (isArray(objectOrArray)) {
        return objectOrArray
            .sort(sortByValues)
            .reduce((prev, сurr, ind) => nestElement(prev, сurr, `[${ind}]`, prefix), {});
    } else {
        if (objectOrArray == null)  return null;

        return Object.keys(objectOrArray)
            .sort()
            .reduce((prev, element) => nestElement(prev, objectOrArray[element], element, prefix),{});
    }
}

function diff(objA: object, objB: object, key: string): Difference | null {
    const [valueInObjA, valueInObjB] = [objA[key], objB[key]];

    if(valueInObjA === valueInObjB)  return null;

    let type = DiffType.UPDATED;
    if (isUndefined(valueInObjA) || isUndefined(valueInObjB)) {
        type = isUndefined(valueInObjA) ? DiffType.ADDED : DiffType.REMOVED;
    }

    return { key, valueInObjA, valueInObjB, type }
}

function compare(objA: object, objB: object): CompareResult {
    if (!isObject(objA) || !isObject(objB) || (isArray(objA) !== isArray(objB))) {
        throw new Error("objA or objB are not object or array or have different types");
    }

    [objA, objB] = [flatten(objA, ''), flatten(objB, '')];

    let keys = (Object.keys(objA).concat(Object.keys(objB)))
        .filter((val, ind, arr) => ind <= arr.indexOf(val));

    const result = keys
        .map((val, ind, arr) => diff(objA, objB, val))
        .filter(diff => !!diff);

    return {
        equal: result.length === 0,
        diff: <Difference[]>result
    }
}

export { CompareResult, Difference, DiffType, compare };