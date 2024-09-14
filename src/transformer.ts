import ts from 'typescript';

export function dunderTransformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  const checker = program.getTypeChecker();

  return (context: ts.TransformationContext) => {
    const visitor: ts.Visitor = (node) => {
      if (ts.isBinaryExpression(node)) {
        const operator = node.operatorToken.kind;
        const dunderMethodName = getDunderMethodName(operator);

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

      return ts.visitEachChild(node, visitor, context);
    };

    return (file: ts.SourceFile) => ts.visitEachChild(file, visitor, context);
  };
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
