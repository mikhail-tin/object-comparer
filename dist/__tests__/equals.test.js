"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
test('compare empty objects', () => {
    expect(index_1.compare({}, {}).length).toBe(0);
});
test('compare empty arrays', () => {
    expect(index_1.compare([], []).length).toBe(0);
});
test('compare equal object with different fields order', () => {
    var a = {
        first: "12345",
        second: 12345,
        third: null,
        fourth: { first: "12345", second: 12345, third: null },
        fifth: ["1", 2, 3.5]
    };
    var b = {
        fourth: { third: null, second: 12345, first: "12345" },
        second: 12345,
        first: "12345",
        fifth: [2, 3.5, "1"],
        third: null,
    };
    var result = index_1.compare(a, b);
    var diff = result.length;
    expect(diff).toBe(0);
});
//# sourceMappingURL=equals.test.js.map