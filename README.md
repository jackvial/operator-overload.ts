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

# Compile
`npm run build` or `npx ts-node src/compile.ts`

# Run Example
`npm run example` or `node dist/index.js`