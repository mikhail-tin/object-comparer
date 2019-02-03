import { compare, DiffType, Difference, CompareResult } from '../src/index';


const filterByType = (res: CompareResult, type: DiffType) => res.diff.filter(x=>x.type === type);

const notEmptyObject = { 
  v1: 1, 
  v2: true, 
  v3: 'Qwerty', 
  v4: null,
  v5: [1, "2", { v: 3} ],
  v6: { v1: "1", v2: 2 }
};
const countValuesInNotEmptyObject = 9;
const emptyObject = { }

test('compare object with values and empty object', () => {
  const result = compare(notEmptyObject, emptyObject)
  const absentInA = result.diff.filter(x=>x.type == DiffType.ADDED)
  const absentInB = result.diff.filter(x=>x.type == DiffType.REMOVED)

  expect(result.equal).toBeFalsy()
  expect(absentInA).toHaveLength(0)
  expect(absentInB).toHaveLength(countValuesInNotEmptyObject)
});

test('compare empty object and object with values', () => {
  const result = compare(emptyObject, notEmptyObject)
  const absentInA = result.diff.filter(x=>x.type == DiffType.ADDED)
  const absentInB = result.diff.filter(x=>x.type == DiffType.REMOVED)

  expect(result.equal).toBeFalsy()
  expect(absentInA).toHaveLength(countValuesInNotEmptyObject)
  expect(absentInB).toHaveLength(0)
});

test('compare ', () => {

  let b = JSON.parse(JSON.stringify(notEmptyObject));
  b.v1 = "new value";

  const result = compare(notEmptyObject, b)


  expect(result.equal).toBeFalsy()

});
