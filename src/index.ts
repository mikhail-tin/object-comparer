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
const isTrueObject = (val) => typeof(val) == 'object' && val != null;
const isArray = Array.isArray;
const isUndefined = (val) => val === undefined;

const sortByValues = (a: any, b: any): number => {
    var ja = isObject(a) ? JSON.stringify(flatten(a)) : JSON.stringify(a)
    var jb = isObject(b) ? JSON.stringify(flatten(b)) : JSON.stringify(b)

    return Number((ja > jb)) - Number((ja < jb));
};

const nestElement = (previousValue :any, currentValue :any, key: string, prefix = '') => {
    return currentValue && isObject(currentValue)
        ? { ...previousValue, ...flatten(currentValue, `${prefix}${key}.`, key) }
        : { ...previousValue, ...{ [`${prefix}${key}`]: currentValue } };
};

function flatten(objectOrArray, prefix = '', key = ''): any {
    let result;

    if (isArray(objectOrArray)) {
        result = objectOrArray
            .sort(sortByValues)
            .reduce((prev, сurr, ind) => nestElement(prev, сurr, `[${ind}]`, prefix), {});
    } else {
        if (objectOrArray == null)  return null;
        result = Object.keys(objectOrArray)
            .sort()
            .reduce((prev, element) => nestElement(prev, objectOrArray[element], element, prefix),{}); 
    }

    if (!!key) {
        result[`${prefix.substring(0, prefix.length-1)}`] = objectOrArray;
    }
    
    return result;
}

function diff(objA: object, objB: object, key: string, foundedDiff: Difference[] = []): Difference | null {
    const [valInObjA, valInObjB] = [objA[key], objB[key]];

    if((isTrueObject(valInObjA) && isTrueObject(valInObjB)) || valInObjA === valInObjB) return null;

    if(foundedDiff.findIndex(x=> !!x && key.includes(x.key, 0)) !== -1) return null;

    let type = DiffType.UPDATED;
    if (isUndefined(valInObjA) || isUndefined(valInObjB)) {
        type = isUndefined(valInObjA) ? DiffType.ADDED : DiffType.REMOVED;
    }

    return { key: key, valueInObjA: valInObjA, valueInObjB: valInObjB, type }
}

function compare(objA: object, objB: object): CompareResult {
    if (!isObject(objA) || !isObject(objB) || (isArray(objA) !== isArray(objB))) {
        throw new Error("objA or objB are not object or array or have different types");
    }

    [objA, objB] = [flatten(objA), flatten(objB)];

    let keys = (Object.keys(objA).concat(Object.keys(objB)))
        .filter((val, ind, arr) => ind <= arr.indexOf(val))
        .sort();

    var r2: Difference[] = [];
    keys.forEach(key => r2.push(<Difference>diff(objA, objB, key, r2)))
    r2 = r2.filter(diff => !!diff);

    return {
        equal: r2.length === 0,
        diff: <Difference[]>r2
    }
}

export { CompareResult, Difference, DiffType, compare };