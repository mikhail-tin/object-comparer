interface CompareResult {
    equal: boolean;
    diff: Difference[];
}

interface Difference {
    key: string;
    valueInObjectA: any;
    valueInObjectB: any;
    type: DiffType;
}

enum DiffType {
    ADDED,
    REMOVED,
    UPDATED
}

const isArray = Array.isArray;
const isObject = (val) => typeof(val) == 'object';
const isTrueObject = (val) => typeof(val) == 'object' && val != null && !isArray(val);
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

function flatten(objectOrArray, prefix = '', key = '', arraySortingAlgorithm = sortByValues): any {
    let result;

    if (isArray(objectOrArray)) {
        result = objectOrArray
            .sort(arraySortingAlgorithm)
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
    const [valInA, valInB] = [objA[key], objB[key]];

    const areObjectsData = isTrueObject(valInA) && isTrueObject(valInB)
    if(areObjectsData || valInA === valInB) return null;

    if(isArray(valInA) && isArray(valInB)) {
        return  valInA.length !== valInB.length
            ? { key: key, valueInObjectA: valInA, valueInObjectB: valInB, type: DiffType.UPDATED }
            : null;
    }

    if(foundedDiff.some(x=> !!x && key.startsWith(x.key))) return null;

    let type = DiffType.UPDATED;
    if (isUndefined(valInA) || isUndefined(valInB)) {
        type = isUndefined(valInA) ? DiffType.ADDED : DiffType.REMOVED;
    }

    return { key: key, valueInObjectA: valInA, valueInObjectB: valInB, type }
}

function compare(objA: object, objB: object, arraySortingAlgorithm = sortByValues): CompareResult {
    if (!isObject(objA) || !isObject(objB) || (isArray(objA) !== isArray(objB))) {
        throw new Error("objA or objB are not object or array or have different types");
    }

    [objA, objB] = [flatten(objA, '', '', arraySortingAlgorithm), flatten(objB, '', '', arraySortingAlgorithm)];

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