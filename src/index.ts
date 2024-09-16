class Tensor {
    value: number[][];

    constructor(value: number[][]) {
        this.value = value;
    }

    __add__(other: Tensor): Tensor {
        const result = addMatrices(this.value, other.value);
        return new Tensor(result);
    }

    __sub__(other: Tensor): Tensor {
        const result = subtractMatrices(this.value, other.value);
        return new Tensor(result);
    }

    __mul__(other: Tensor): Tensor {
        // Check if 'other' is a scalar Tensor (i.e., a 1x1 matrix)
        if ((other.value.length === 1 && other.value[0].length === 1)) {
            const scalar = other.value[0][0];
            const result = this.value.map(row => row.map(val => val * scalar));
            return new Tensor(result);

        // Check if this Tensor is a scalar (1x1 matrix)
        } else if (
            this.value.length === 1 && this.value[0].length === 1
        ) {
            const scalar = this.value[0][0];
            const result = other.value.map(row => row.map(val => val * scalar));
            return new Tensor(result);
        } else {
            // Perform matrix multiplication
            const result = multiplyMatrices(this.value, other.value);
            return new Tensor(result);
        }
    }
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

// console.log('a: ', a);
// console.log('b: ', b);

// console.log('Tensor Tensor Multiplication Example');
// @ts-ignore
const c = a * b * 2;
console.log("c: ", c);
// console.log('-----------------------------------');

// console.log('Tensor Scalar Multiplication Example (Scalar Right)');
// // @ts-ignore
// const d = a * 2;
// console.log("d: ", d)
// console.log('-----------------------------------');

// console.log('Tensor Scalar Multiplication Example (Scalar Left)');
// // @ts-ignore
// const e = 2 * a;
// console.log("e: ", e);