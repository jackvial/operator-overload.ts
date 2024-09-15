// transformer.ts

import * as ts from 'typescript';

export function tensorScalarMultiplicationTransformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  const checker = program.getTypeChecker();
  return (context: ts.TransformationContext) => {
    const visit: ts.Visitor = (node: ts.Node): ts.Node => {
      // Check for binary expressions with the '*' operator
      if (ts.isBinaryExpression(node)) {
        const left = node.left;
        const right = node.right;

        const operator = node.operatorToken.kind;

        // Tensor * Scalar or Scalar * Tensor case
        if (operator === ts.SyntaxKind.AsteriskToken) {
          const isLeftTensor = isTensor(left);
          const isRightTensor = isTensor(right);
          const isLeftNumber = ts.isNumericLiteral(left);
          const isRightNumber = ts.isNumericLiteral(right);
  
          
          if ((isLeftTensor && isRightNumber) || (isLeftNumber && isRightTensor)) {
            // Wrap the scalar number into a Tensor
            const newLeft = isLeftNumber ? wrapScalarInTensor(left) : left;
            const newRight = isRightNumber ? wrapScalarInTensor(right) : right;
  
            // Transform into method call: left.__mul__(right)
            return ts.factory.createCallExpression(
              ts.factory.createPropertyAccessExpression(
                newLeft as ts.Expression,
                '__mul__'
              ),
              undefined,
              [newRight as ts.Expression]
            );
          }
        }

        const dunderMethodName = getDunderMethodName(operator);

        // Tensor (*|+|-) Tensor cases
        if (dunderMethodName) {
          const leftType = checker.getTypeAtLocation(node.left);
          const classSymbol = leftType.getSymbol();

          if (classSymbol && hasMethod(classSymbol, dunderMethodName)) {
            // Replace the binary expression with a method call
            return ts.factory.createCallExpression(
              ts.factory.createPropertyAccessExpression(node.left, dunderMethodName),
              undefined,
              [node.right]
            );
          }
        }
      }

      return ts.visitEachChild(node, visit, context);
    };

    return (file: ts.SourceFile) => ts.visitEachChild(file, visit, context);
  };
}

// Helper function to determine if a node is a Tensor instance
function isTensor(node: ts.Node): boolean {
  // This function can be enhanced to better detect Tensor instances
  // For now, we assume that identifiers and new expressions may represent Tensors
  if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'Tensor') {
    return true;
  }
  if (ts.isIdentifier(node)) {
    // In a real-world scenario, you might check type information here
    return true;
  }
  return false;
}

// Helper function to wrap a scalar number into a Tensor instance
function wrapScalarInTensor(node: ts.Expression): ts.NewExpression {
  return ts.factory.createNewExpression(
    ts.factory.createIdentifier('Tensor'),
    undefined,
    [
      ts.factory.createArrayLiteralExpression([
        ts.factory.createArrayLiteralExpression([node]),
      ]),
    ]
  );
}


function getDunderMethodName(operator: ts.SyntaxKind): string | null {
  switch (operator) {
    case ts.SyntaxKind.PlusToken:
      return '__add__';
    case ts.SyntaxKind.MinusToken:
      return '__sub__';
    case ts.SyntaxKind.AsteriskToken:
      return '__mul__'; // Map '*' to '__mul__'
    default:
      return null;
  }
}

function hasMethod(symbol: ts.Symbol, methodName: string): boolean {
  const members = symbol.members;
  if (members) {
    return members.has(ts.escapeLeadingUnderscores(methodName));
  }
  return false;
}