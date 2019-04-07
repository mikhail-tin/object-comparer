interface CompareResult {
    equal: boolean;
    diff: Difference[];
}

interface Difference {
    key: string;
    valueInObjectA: any;
    valueInObjectB: any;
    type: DiffType;
    //subDiffs: Difference[]
}

interface CompareSettings {
    reorderByValues?: boolean;
    arraySortingFunc?: (a,b) => number;
}

enum DiffType {
    ADDED,
    REMOVED,
    UPDATED
}

interface Key {
    parent: string;
    key: string;
}

const getDifference = (key, valInA, valInB, type): Difference => {
    return { 
        key: key, 
        valueInObjectA: valInA, 
        valueInObjectB: valInB, 
        type: type, 
        //subDiffs: []
    };
}

const isArray = Array.isArray;
const isObject = (val) => typeof(val) == 'object';
const isTrueObject = (val) => typeof(val) == 'object' && val != null && !isArray(val);
const isUndefined = (val) => val === undefined;

const sortByValuesFunc = (a: any, b: any): number => {
    var ja = isObject(a) ? JSON.stringify(flatten(a,'','', sortByValuesFunc)) : JSON.stringify(a);
    var jb = isObject(b) ? JSON.stringify(flatten(b,'','', sortByValuesFunc)) : JSON.stringify(b);

    return Number((ja > jb)) - Number((ja < jb));
};

const nestElement = (previousValue :any, currentValue :any, key: string, prefix = '', arraySortingFunction) => {
    return currentValue && isObject(currentValue)
        ? { ...previousValue, ...flatten(currentValue, `${prefix}${key}.`, key, arraySortingFunction) }
        : { ...previousValue, ...{ [`${prefix}${key}`]: currentValue } };
};

function flatten(objectOrArray, prefix = '', key = '', arraySortingFunction): any {
    let result;

    if (isArray(objectOrArray)) {
        result = objectOrArray
            .sort(arraySortingFunction)
            .reduce((prev, сurr, ind) => nestElement(prev, сurr, `[${ind}]`, prefix, arraySortingFunction), {});
    } else {
        if (objectOrArray == null)  return null;
        result = Object.keys(objectOrArray)
            .sort()
            .reduce((prev, element) => nestElement(prev, objectOrArray[element], element, prefix, arraySortingFunction),{}); 
    }

    if (!!key) {
        result[`${prefix.substring(0, prefix.length-1)}`] = objectOrArray;
    }
    
    return result;
}

const isTrueObjects = (valInA, valInB) => (isTrueObject(valInA) && isTrueObject(valInB));
const isArrays = (valInA, valInB) => isArray(valInA) && isArray(valInB);
const isEqual = (valInA, valInB) => valInA === valInB;
const isDifferenceInParentFound = (foundedDiff, key) => foundedDiff.some(x=> !!x && key.startsWith(x.key))

function diff(objA: object, objB: object, formedKey: Key, foundedDiff: Difference[] = []): Difference | null {
    const key = `${formedKey.parent}${formedKey.key}`;
    const [valInA, valInB] = [objA[key], objB[key]];

    if (isEqual(valInA, valInB) || isTrueObjects(valInA, valInB)) return null;

    if(isArrays(valInA, valInB)) {
        return  valInA.length !== valInB.length
            ? getDifference(key, valInA, valInB, DiffType.UPDATED)
            : null;
    }   

    let type = DiffType.UPDATED;
    if (isUndefined(valInA) || isUndefined(valInB)) {
        type = isUndefined(valInA) ? DiffType.ADDED : DiffType.REMOVED;
    }

    if (isDifferenceInParentFound(foundedDiff, key)) {
        /*const currentValueIsArrayElement = formedKey.key.match(/(.[)(\d{1,4})(])/g) !== null;
        if (currentValueIsArrayElement) {
            var subDiff = getDifference(key, valInA, valInB, type);
            var d = <Difference>foundedDiff.find(x=> !!x && key.startsWith(x.key));
            d.subDiffs.push(subDiff)
        }*/
        return null;
    }

    return getDifference(key, valInA, valInB, type);
}

const getSortByValueFunction = () => {

}

function compare(objA: object, objB: object, settings: CompareSettings = {reorderByValues: true,}): CompareResult {

    const arraySortingFunction = 
        settings.arraySortingFunc  
            ? settings.arraySortingFunc : settings.reorderByValues
                ? sortByValuesFunc : (a,b) => 0;

    if (!isObject(objA) || !isObject(objB) || (isArray(objA) !== isArray(objB))) {
        throw new Error("objA or objB are not object or array or have different types");
    }

    if(isArray(objA) && isArray(objB) && objA.length !== objB.length) {
        return { equal: false, diff: [ getDifference("", objA, objB, DiffType.UPDATED)] }
    }

    [objA, objB] = [flatten(objA, '', '', arraySortingFunction), flatten(objB, '', '', arraySortingFunction)];

    let keys = (Object.keys(objA).concat(Object.keys(objB)))
        .filter((val, ind, arr) => ind <= arr.indexOf(val))
        .sort();

    const formedKeys: Key[] = []; 

    for (let i=0; i < keys.length; i++) {
        const path = keys[i];

        const parent =  path.substring(0, path.lastIndexOf('.'))
        const key =  path.substring(path.lastIndexOf('.'))
        
        formedKeys.push({parent, key})
    }

    var r2: Difference[] = [];
    formedKeys.forEach(key => r2.push(<Difference>diff(objA, objB, key, r2)))
    r2 = r2.filter(diff => !!diff);

    return {
        equal: r2.length === 0,
        diff: <Difference[]>r2
    }
}

export { CompareResult, Difference, DiffType, compare };