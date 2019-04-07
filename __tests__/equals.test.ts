import { compare } from '../src/index'

test('compare empty objects', () => {
  expect(compare({}, {}).equal).toBeTruthy()
});

test('compare empty arrays', () => {
  expect(compare([], []).equal).toBeTruthy()
});

test('compare equal objects with primitives', () => {
  const a = { v1: 1, v2: true, v3: 'Qwerty', v4: null, v5: undefined }
  const b = { v1: 1, v2: true, v3: 'Qwerty', v4: null, v5: undefined }
  const reorderedB = { v2: true, v3: 'Qwerty', v4: null, v1: 1, v5: undefined}

  expect(compare(a, b).equal).toBeTruthy()
  expect(compare(a, reorderedB).equal).toBeTruthy()
});

test('compare equal arrays with primitives', () => {
  const a = [ 1, "string", false, null, undefined ]
  const b = [ 1, "string", false, null, undefined ]
  const reorderedB = [ false, null,  "string", undefined, 1 ]

  expect(compare(a, b).equal).toBeTruthy()
  expect(compare(a, reorderedB).equal).toBeTruthy()
});

test('compare equal arrays with hierarchy and disorder', () => {
  const arrA = [
    [
      { v: { v: { v: { v4: 'string', v5: 111 } } } }, 
      []
    ],
    [
      true,
      1,
      false,
      { v: { v4: false } }
    ]
  ];
  const arrB = [
    [
      { v: { v4: false } },
      true,
      false,
      1
    ],
    [
      { v: { v: { v: { v4: 'string', v5: 111 } } } }, 
      []
    ]
  ]

  const res = compare(arrA, arrB)

  expect(res.equal).toBeTruthy()
});

test('compare equal objects with different ordering', () => {
  const a = {
    v1: "12345",
    v2: 12345,
    v3: null,
    v4: true,
    a1: [
      {a1v1: 1, a1v2: "2", a1a1: [1,2,false], a1o1: {a1o1v1: true} },
      {a1v1: 3, a1v2: "1", a1a1: [3,4], a1o1: {a1o1v1: "1"} }, 
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
      {a1v2: "1", a1a1: [3, 4], a1v1: 3, a1o1: {a1o1v1: "1"} },
      {a1a1: [2,false,1], a1v1: 1, a1o1: {a1o1v1: true}, a1v2: "2" },
    ],
    v2: 12345,
    v3: null,
    v1: "12345",
    v4: true,
    a2: [2, 3.5, "1", {a2a1: [2, "1", 3.5] } ]
  };

  const res = compare(a, b)

  expect(res.equal).toBeTruthy()
});
