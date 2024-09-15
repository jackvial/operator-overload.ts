class Tensor {
    value: number[][];
    grad: number[][] | null;
    _backward: (() => void) | null;
    _prev: Set<Tensor>;
    _op: string | null;

    constructor(
        value: number[][],
        _children: Tensor[] = [],
        _op: string | null = null
    ) {
        this.value = value;
        this.grad = null;
        this._backward = null;
        this._prev = new Set(_children);
        this._op = _op;
    }

    __add__(other: Tensor): Tensor {
        const resultValue = addMatrices(this.value, other.value);
        const out = new Tensor(resultValue, [this, other], '+');

        out._backward = () => {
            // Accumulate gradients from the output
            const grad = out.grad!;
            this.grad = addMatrices(this.grad || zerosLike(this.value), grad);
            other.grad = addMatrices(other.grad || zerosLike(other.value), grad);
        };

        return out;
    }

    __sub__(other: Tensor): Tensor {
        const resultValue = subtractMatrices(this.value, other.value);
        const out = new Tensor(resultValue, [this, other], '-');

        out._backward = () => {
            const grad = out.grad!;
            this.grad = addMatrices(this.grad || zerosLike(this.value), grad);
            other.grad = subtractMatrices(other.grad || zerosLike(other.value), grad);
        };

        return out;
    }

    __mul__(other: Tensor): Tensor {
        const resultValue = multiplyMatrices(this.value, other.value);
        const out = new Tensor(resultValue, [this, other], '*');

        out._backward = () => {
            const grad = out.grad!;
            this.grad = addMatrices(
                this.grad || zerosLike(this.value),
                multiplyMatrices(grad, other.value)
            );
            other.grad = addMatrices(
                other.grad || zerosLike(other.value),
                multiplyMatrices(this.value, grad)
            );
        };

        return out;
    }

    // Sum all elements (reduces tensor to scalar)
    sum(): Tensor {
        const sumValue = this.value.reduce((acc, row) => acc + row.reduce((a, b) => a + b, 0), 0);
        const out = new Tensor([[sumValue]], [this], 'sum');

        out._backward = () => {
            const grad = out.grad!;
            const ones = onesLike(this.value);
            this.grad = addMatrices(
                this.grad || zerosLike(this.value),
                multiplyScalar(ones, grad[0][0])
            );
        };

        return out;
    }

    // Backpropagation
    backward(): void {
        const topo: Tensor[] = [];
        const visited = new Set<Tensor>();

        const buildTopo = (v: Tensor) => {
            if (!visited.has(v)) {
                visited.add(v);
                v._prev.forEach(child => buildTopo(child));
                topo.push(v);
            }
        };

        buildTopo(this);

        // Initialize the gradient of the output tensor
        this.grad = onesLike(this.value);

        // Traverse in reverse topological order
        topo.reverse().forEach(tensor => {
            if (tensor._backward) {
                tensor._backward();
            }
        });
    }
}

function zerosLike(a: number[][]): number[][] {
    return a.map(row => row.map(() => 0));
}

function onesLike(a: number[][]): number[][] {
    return a.map(row => row.map(() => 1));
}


function addMatrices(a: number[][], b: number[][]): number[][] {
    if (a.length !== b.length || a[0].length !== b[0].length) {
        throw new Error('Matrices must have the same dimensions for addition');
    }

    return a.map((row, i) => row.map((val, j) => val + b[i][j]));
}


function subtractMatrices(a: number[][], b: number[][]): number[][] {
    if (a.length !== b.length || a[0].length !== b[0].length) {
        throw new Error('Matrices must have the same dimensions for subtraction');
    }

    return a.map((row, i) => row.map((val, j) => val - b[i][j]));
}

function multiply(a: any, b: any): any {
    if (typeof a === 'number' && typeof b === 'number') {
        return a * b;
    } else if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) throw new Error('Arrays must have the same length for multiplication');
        return a.map((val: any, idx: number) => multiply(val, b[idx]));
    } else {
        throw new Error('Multiplication not defined for the given types');
    }
}

function multiplyScalar(a: number[][], scalar: number): number[][] {
    return a.map(row => row.map(val => val * scalar));
}

function multiplyMatrices(a: number[][], b: number[][]): number[][] {
    if (a[0].length !== b.length) {
        throw new Error('Number of columns of the first matrix must equal number of rows of the second matrix');
    }

    const result: number[][] = [];
    for (let i = 0; i < a.length; i++) {
        result[i] = [];
        for (let j = 0; j < b[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < a[0].length; k++) {
                sum += a[i][k] * b[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}


const a = new Tensor([
    [1, 2],
    [3, 4]
]);

const b = new Tensor([
    [5, 6],
    [7, 8]
]);

console.log('a: ', a);
console.log('b: ', b);

console.log('Tensor Tensor Multiplication Example');
// @ts-ignore
const c = a * b;
console.log("c: ", c);
console.log('-----------------------------------');

// Compute gradients
// @ts-ignore
c.backward();

// Outputs
// @ts-ignore
console.log('c:', c.value);

// @ts-ignore
console.log('dc/da:', a.grad);

// @ts-ignore
console.log('dc/db:', b.grad);

// console.log('Tensor Scalar Multiplication Example (Scalar Right)');
// // @ts-ignore
// const d = a * 2;
// console.log("d: ", d)
// console.log('-----------------------------------');

// console.log('Tensor Scalar Multiplication Example (Scalar Left)');
// // @ts-ignore
// const e = 2 * a;
// console.log("e: ", e);