import { compare, DiffType, Difference, CompareResult } from '../src/index';

const notEmptyObject = { 
  v1: 1, 
  v2: true, 
  v3: 'Qwerty', 
  v4: null
};


test('detect removed fields between empty and non empty simple object', () => {
  const result = compare(notEmptyObject, {})

  expect(result.equal).toBeFalsy()
  expect(result.diff.filter(x => x.type == DiffType.REMOVED)).toHaveLength(Object.keys(notEmptyObject).length)
  expect(result.diff.filter(x => x.type != DiffType.REMOVED)).toHaveLength(0)
});

test('detect added fields between empty and non empty simple object', () => {
  const result = compare({}, notEmptyObject)

  expect(result.equal).toBeFalsy()
  expect(result.diff.filter(x => x.type == DiffType.ADDED)).toHaveLength(Object.keys(notEmptyObject).length)
  expect(result.diff.filter(x => x.type != DiffType.ADDED)).toHaveLength(0)
});

test('detect added, removed, updated in simple object', () => {
  let a = {        v2: true, v3: 'Qwerty', v4: null }
  let b = { v1: 1, v2: true,               v4: "11" }

  const result = compare(a, b)
  const added = result.diff.filter(x => x.type == DiffType.ADDED);
  const removed = result.diff.filter(x => x.type == DiffType.REMOVED);
  const updated = result.diff.filter(x => x.type == DiffType.UPDATED);

  expect(result.equal).toBeFalsy()
  expect(added).toHaveLength(1)
  expect(removed).toHaveLength(1)
  expect(updated).toHaveLength(1)
  expect(added[0]).toHaveProperty("key", "v1")
  expect(removed[0]).toHaveProperty("key", "v3")
  expect(updated[0]).toHaveProperty("key", "v4")
});


test('detect added, removed, updated in objects with childs', () => {
  const a = { obj : {        v2: true, v3: 'Qwerty',  v4: null,    v5: {a: 1, b: 3 } }}
  const b = { obj : { v1: 1,           v3: 'Update',  v4: {v1: 9}, v5: {a: 1, b: 22} }}

  const result = compare(a, b)

  const added = result.diff.filter(x => x.type == DiffType.ADDED);
  const removed = result.diff.filter(x => x.type == DiffType.REMOVED);
  const updated = result.diff.filter(x => x.type == DiffType.UPDATED);

  const addedV1 =   { key: "obj.v1", valueInObjectA: undefined, valueInObjectB: b.obj.v1, type: DiffType.ADDED }
  const removedV2 = { key: "obj.v2", valueInObjectA: a.obj.v2, valueInObjectB: undefined, type: DiffType.REMOVED }
  const updatedV3 = { key: "obj.v3", valueInObjectA: a.obj.v3, valueInObjectB: b.obj.v3, type: DiffType.UPDATED }
  const updatedV4 = { key: "obj.v4", valueInObjectA: a.obj.v4, valueInObjectB: b.obj.v4, type: DiffType.UPDATED }
  const updatedV5b= { key: "obj.v5.b", valueInObjectA: a.obj.v5.b, valueInObjectB: b.obj.v5.b, type: DiffType.UPDATED } 

  expect(result.equal).toBeFalsy()
  expect(added).toHaveLength(1)
  expect(removed).toHaveLength(1)
  expect(updated).toHaveLength(3)
  expect(added[0]).toMatchObject(addedV1)
  expect(removed[0]).toMatchObject(removedV2)
  expect(updated[0]).toMatchObject(updatedV3)
  expect(updated[1]).toMatchObject(updatedV4)
  expect(updated[2]).toMatchObject(updatedV5b)
});



test('compare objects with array with different length', () => {
  const a = {
    a1: [
      {a1v1: 1, a1v2: "2" },
      {a1v1: 3, a1v2: "1" }, 
    ]
  };
  const b = {
    a1: [
      { a1v1: 1, a1v2: "2" },
    ],
  };

  const result = compare(a, b)

  expect(result.equal).toBeFalsy()
  expect(result.diff).toHaveLength(1)
  expect(result.diff[0].key).toBe("a1")
  expect(result.diff[0].type).toBe(DiffType.UPDATED)
  expect(result.diff[0].valueInObjectA.length).toBe(2)
  expect(result.diff[0].valueInObjectB.length).toBe(1)
});


test('compare arrays with different length', () => {
  const a = [1,    3];
  const b = [1, 2, 3];

  const result = compare(a, b)

  expect(result.equal).toBeFalsy()
  expect(result.diff).toHaveLength(1)
  expect(result.diff[0].key).toBe("")
  expect(result.diff[0].type).toBe(DiffType.UPDATED)
  expect(result.diff[0].valueInObjectA).toBe(a)
  expect(result.diff[0].valueInObjectB).toBe(b)
});

/*
test('compare different crazy objects with different ordering', () => {
  const a = { a2: ["1",  2, { a2a1: ["1", 2, 3.5] },  3.5 ] };
  const b = { a2: [ 2,  3.5, "W.5", { a2a1: [ 2, "1", 3.5] } ] };

  const a1 = { a2: ["1",  2, { a2a1: ["1", 2, 3.5] },  3.5 ] };
  const b1 = { a2: [ 2,  "0", "1", { a2a1: [ 2,  "1", 3.5] } ] };

  const result = compare(a, b)
  const result1 = compare(a1, b1)

  expect(result.equal).toBeFalsy()
  expect(result2.equal).toBeFalsy()
});

test('difference', () => {
  const result = compare(
    ["1",  2,  3.5, {a2a1: ["1", 2, 3.5]}],
    [ 2,  3.5,      {a2a1: ["1", 2, 3.5]}] )

  expect(result.equal).toBeTruthy()
});
*/
