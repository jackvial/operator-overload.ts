# Operator Overload TS
Using TS Compiler API to add operator overloading to TS

# Examples
```
console.log('Tensor Tensor Multiplication Example');
// @ts-ignore
const c = a * b;
console.log("c: ", c);
console.log('-----------------------------------');

console.log('Tensor Scalar Multiplication Example (Scalar Right)');
// @ts-ignore
const d = a * 2;
console.log("d: ", d)
console.log('-----------------------------------');

console.log('Tensor Scalar Multiplication Example (Scalar Left)');
// @ts-ignore
const e = 2 * a;
console.log("e: ", e);
```

```
✔ ~/Code/ts/operator-overload.ts [main|✔] 
20:58 $ npm run example

> operator-overload-ts@1.0.0 example
> node dist/index.js

a:  Tensor { value: [ [ 1, 2 ], [ 3, 4 ] ] }
b:  Tensor { value: [ [ 5, 6 ], [ 7, 8 ] ] }
Tensor Tensor Multiplication Example
c:  Tensor { value: [ [ 19, 22 ], [ 43, 50 ] ] }
-----------------------------------
Tensor Scalar Multiplication Example (Scalar Right)
d:  Tensor { value: [ [ 2, 4 ], [ 6, 8 ] ] }
-----------------------------------
Tensor Scalar Multiplication Example (Scalar Left)
e:  Tensor { value: [ [ 2, 4 ], [ 6, 8 ] ] }
```

# Compile
`npm run build` or `npx ts-node src/compile.ts`

# Run Example
`npm run example` or `node dist/index.js`