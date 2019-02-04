# object-comparer

## For what

Compare objects and arrays by meaning(ordering is ignored).

Not done yet.

## How to use

```js
import { compare } from 'compare'

var a = { ... };
var b = { ... };
var compareResult = compare(a, b);
/*
compareResult: {
    equal: boolean
    diff: [ ... ]
}
*/
```
