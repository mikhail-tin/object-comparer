"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
test('compare empty array and object', () => {
    expect(() => index_1.compare({}, [])).toThrowError();
});
test('compare not empty array and object', () => {
    expect(() => index_1.compare({ a: 1 }, [1])).toThrowError();
});
//# sourceMappingURL=throws.test.js.map