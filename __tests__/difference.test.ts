import { compare, DiffType, Difference, CompareResult } from '../src/index';

const notEmptyObject = { 
  v1: 1, 
  v2: true, 
  v3: 'Qwerty', 
  v4: null
};

const groupChanges = (compareResult) => {
  return {
    added: compareResult.diff.filter(x => x.type == DiffType.ADDED),
    removed: compareResult.diff.filter(x => x.type == DiffType.REMOVED),
    updated: compareResult.diff.filter(x => x.type == DiffType.UPDATED)
  }
}

const checkChangesCounts = (groupedChanges, added, removed, updated) => {
  expect(groupedChanges.added).toHaveLength(added)
  expect(groupedChanges.removed).toHaveLength(removed)
  expect(groupedChanges.updated).toHaveLength(updated)
}

test('detect removed fields between empty and non empty simple object', () => {
  const result = compare(notEmptyObject, {})
  const groupedChanges = groupChanges(result);
  const fieldsCount = Object.keys(notEmptyObject).length;

  expect(result.equal).toBeFalsy()
  checkChangesCounts(groupedChanges, 0, fieldsCount, 0)
});

test('detect added fields between empty and non empty simple object', () => {
  const result = compare({}, notEmptyObject)
  const groupedChanges = groupChanges(result)
  const fieldsCount = Object.keys(notEmptyObject).length

  expect(result.equal).toBeFalsy()
  checkChangesCounts(groupedChanges, fieldsCount, 0, 0)
});

test('detect added, removed, updated in simple/flat objects', () => {
  let a = JSON.parse(JSON.stringify(notEmptyObject))
  a.v1 = undefined
  let b = JSON.parse(JSON.stringify(notEmptyObject))
  b.v2 = undefined
  b.v3 = "updated value"

  const result = compare(a, b)
  const groupedChanges = groupChanges(result)

  const added = {key: 'v1', type: DiffType.ADDED, valueInObjA: a.v1, valueInObjB: b.v1 }
  const removed = {key: 'v2', type: DiffType.REMOVED, valueInObjA: a.v2, valueInObjB: b.v2 }
  const updated = {key: 'v3', type: DiffType.UPDATED, valueInObjA: a.v3, valueInObjB: b.v3 }

  expect(result.equal).toBeFalsy()
  checkChangesCounts(groupedChanges, 1, 1, 1)
  expect(groupedChanges.added[0]).toEqual(added)
  expect(groupedChanges.removed[0]).toEqual(removed)
  expect(groupedChanges.updated[0]).toEqual(updated)
});

test('detect  objects', () => {
  let a = JSON.parse(JSON.stringify({}))
  a.obj = {
    //v1: 1, 
    v2: true, 
    v3: 'Qwerty', 
    v4: null
  }
  let b = JSON.parse(JSON.stringify({}))
  b.obj = {
    v1: 1,
    //v2: true, 
    v3: 'Updated', 
    v4: {v1: 9}
  }

  const result = compare(a, b)
  const groupedChanges = groupChanges(result)

  expect(result.equal).toBeFalsy()
  checkChangesCounts(groupedChanges, 1, 1, 2)
  expect(groupedChanges.added[0]).toEqual({key: "obj.v1", valueInObjA: undefined, valueInObjB: 1, type: 0})
  expect(groupedChanges.removed[0]).toEqual({key: "obj.v2", valueInObjA: true, valueInObjB: undefined, type: 1})
  expect(groupedChanges.updated[0]).toEqual({key: "obj.v3", valueInObjA: "Qwerty", valueInObjB: "Updated", type: 2})
  expect(groupedChanges.updated[1]).toEqual({key: "obj.v4", valueInObjA: null, valueInObjB: {v1: 9}, type: 2})
});


test('compare equal crazy objects with different ordering', () => {
  const a = {
    v1: "12345",
    v2: 12345,
    //v3: null,
    v4: true,
    a1: [
      {a1v1: 1, a1v2: "2", a1a1: [1,2,false], a1o1: {a1o1v1: true} },
      {a1v1: 3, a1v2: "1", a1a1: [3,4], /*a1o1: {a1o1v1: "1"}*/ }, 
    ],
    a2: ["1", 2, {a2a1: ["1", 2, 3.5] } ,3.5],
    o1: {
      o1v1: "qwerty",
      o1a1: [
        {o1a1a1: [], o1a1o1: {}, o1a1a2: [{}, {}]},
        {o1a1a1: [1], o1a1o1: {o1a1o1o1: []}, o1a1a2: [{}]}
      ]
    },
  };

  const b = {
    o1: {
      o1v1: "qwerty",
      o1a1: [
        {o1a1a1: [], o1a1o1: {}, o1a1a2: [{}, {}]},
        {o1a1a1: [1], o1a1o1: {o1a1o1o1: []}, o1a1a2: [{}]}
      ]
    },
    a1: [
      //{a1v2: "1", a1a1: [3, 4], a1v1: 3, a1o1: {a1o1v1: "1"} },
      {a1a1: [2,false,1], a1v1: 1, a1o1: {a1o1v1: true}, a1v2: "2" },
    ],
    v2: 12345,
    v3: null,
    v1: "12345",
    //v4: true,
    a2: [2, 3.5, /*"1",*/ {a2a1: [2, "1", 3.5] } ]
  };

  const result = compare(a, b)
  expect(compare(a, b).equal).toBeTruthy()
});
