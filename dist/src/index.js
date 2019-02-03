"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Difference;
(function (Difference) {
    Difference[Difference["ABSENT_IN_A"] = 0] = "ABSENT_IN_A";
    Difference[Difference["ABSENT_IN_B"] = 1] = "ABSENT_IN_B";
    Difference[Difference["DIFFERENT"] = 2] = "DIFFERENT";
    Difference[Difference["SUNDRY"] = 3] = "SUNDRY";
    Difference[Difference["EQUAL"] = 4] = "EQUAL";
})(Difference || (Difference = {}));
exports.Difference = Difference;
function getFlatten(objectOrArray, prefix = '') {
    const nestElement = (previousValue, currentValue, key) => {
        return currentValue && typeof currentValue === 'object'
            ? { ...previousValue, ...getFlatten(currentValue, `${prefix}${key}.`) }
            : { ...previousValue, ...{ [`${prefix}${key}`]: currentValue } };
    };
    if (Array.isArray(objectOrArray)) {
        return objectOrArray.sort().reduce(nestElement, {});
    }
    else {
        return Object.keys(objectOrArray)
            .reduce((prev, element) => nestElement(prev, objectOrArray[element], element), {});
    }
}
function diff(objA, objB, key) {
    const valueInObjAUndefined = objA[key] !== undefined;
    const valueInObjBUndefined = objB[key] !== undefined;
    const [a, b] = [objA[key], objB[key]];
    let type;
    if (a === b) {
        type = Difference.EQUAL;
    }
    else {
        type = valueInObjAUndefined
            ? Difference.ABSENT_IN_A : valueInObjBUndefined
            ? Difference.ABSENT_IN_B : (typeof (a) === typeof (b))
            ? Difference.SUNDRY : Difference.DIFFERENT;
    }
    return {
        keyInObjA: valueInObjAUndefined ? key : "",
        keyInObjB: valueInObjBUndefined ? key : "",
        valueInObjA: a,
        valueInObjB: b,
        diff: type
    };
}
function checkArgs(objA, objB) {
    if (Array.isArray(objA) !== Array.isArray(objB) || typeof (objA) !== typeof (objB)) {
        throw new Error("objA and objB have different types");
    }
    if (typeof (objA) !== typeof ({}) || typeof (objB) !== typeof ({})) {
        throw new Error("objA or objB are not object or array");
    }
}
function compare(objA, objB) {
    checkArgs(objA, objB);
    [objA, objB] = [getFlatten(objA, ''), getFlatten(objB, '')];
    const r1 = Object.keys(objA).map((key) => diff(objA, objB, key));
    const r2 = Object.keys(objB).map((key) => diff(objB, objA, key));
    const result = (r1.concat(r2))
        .filter(item => item.diff !== Difference.EQUAL)
        .filter((item, ind, arr) => ind === arr.findIndex(x => x.keyInObjA === item.keyInObjA));
    return result;
}
exports.compare = compare;
//# sourceMappingURL=index.js.map