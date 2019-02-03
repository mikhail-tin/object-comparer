import { Difference, DiffType, CompareResult } from './interfaces'

const isObject = (val) => typeof(val) == 'object';
const isArray = Array.isArray;

const sortByValues = (a: any, b: any): number => {
    var ja = isObject(a) ? JSON.stringify(flatten(a)) : JSON.stringify(a)
    var jb = isObject(b) ? JSON.stringify(flatten(b)) : JSON.stringify(b)

    return Number((ja > jb)) - Number((ja < jb));
}

const nestElement = (previousValue :any, currentValue :any, key: string, prefix = '') => {
    return currentValue && isObject(currentValue)
        ? { ...previousValue, ...flatten(currentValue, `${prefix}${key}.`) }
        : { ...previousValue, ...{ [`${prefix}${key}`]: currentValue } };
};

function flatten(objectOrArray, prefix = ''): any {
    if (Array.isArray(objectOrArray)) {
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

function diff(objA: object, objB: object, key: string): Difference {
    const valueInObjAUndefined = objA[key] === undefined;
    const valueInObjBUndefined = objB[key] === undefined;
    const [a, b] = [objA[key], objB[key]];
    let type;

    if (a === b) {
        type = DiffType.NONE
    } else {
        type = DiffType.UPDATED;
        if (valueInObjAUndefined || valueInObjBUndefined) {
            type = valueInObjAUndefined ? DiffType.ADDED  : DiffType.REMOVED;
        }
    }

    return {
        keyInObjA: !valueInObjAUndefined ? key : "",
        keyInObjB: !valueInObjBUndefined ? key : "",
        valueInObjA:  a,
        valueInObjB: b,
        type: type
    }
}

function compare(objA: object, objB: object): CompareResult {
    if (!isObject(objA) || !isObject(objB) || (isArray(objA) !== isArray(objB))) {
        throw new Error("objA or objB are not object or array or have different types");
    }

    [objA, objB] = [flatten(objA, ''), flatten(objB, '')];

    const r1 = Object.keys(objA).map((key) => diff(objA, objB, key));
    const r2 = Object.keys(objB).map((key) => diff(objA, objB, key));

    const result = (r1.concat(r2))
        .filter(diff => diff.type !== DiffType.NONE);

    return {
        equal: result.length === 0,
        diff: result
    }
}

export { compare, CompareResult, Difference, DiffType };