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
  let a = JSON.parse(JSON.stringify(notEmptyObject))
  a.obj = { v2: true, v3: 'Qwerty', v4: null}
  let b = JSON.parse(JSON.stringify(notEmptyObject))
  b.obj = {v1: 1, v3: 'Updated', v4: {v1: 9}}


  const result = compare(a, b)
  const groupedChanges = groupChanges(result)

  expect(result.equal).toBeFalsy()
  checkChangesCounts(groupedChanges, 1, 1, 1)

});