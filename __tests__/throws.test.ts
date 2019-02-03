import { compare } from '../src/index';

test('compare array and object lead to exception', () => {
    expect(() => compare({}, [])).toThrowError()
    expect(() => compare({a: 1}, [1])).toThrowError()
});
