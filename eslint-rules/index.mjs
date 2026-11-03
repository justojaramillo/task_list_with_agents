/**
 * Reglas locales del proyecto. Se registran en eslint.config.mjs.
 *
 * - max-methods-per-class: una clase no debe acumular responsabilidades.
 * - no-unknown-outside-narrowing: `unknown` solo entra por un type guard o un catch.
 */

const FUNCTION_TYPES = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

function enclosingFunction(node) {
  let current = node.parent;
  while (current) {
    if (FUNCTION_TYPES.has(current.type)) return current;
    current = current.parent;
  }
  return null;
}

function isTypeGuard(fn) {
  return fn?.returnType?.typeAnnotation?.type === "TSTypePredicate";
}

function isCatchParameter(node) {
  let current = node.parent;
  while (current) {
    if (current.type === "CatchClause") return true;
    if (FUNCTION_TYPES.has(current.type)) return false;
    current = current.parent;
  }
  return false;
}

/**
 * Una variable del borde (`const raw: unknown = await request.json()`) es el
 * idioma canónico para recibir datos sin tipo. TypeScript obliga a estrechar
 * antes de usarla, así que no propaga incertidumbre como un parámetro o un
 * tipo de retorno.
 */
function isBoundaryVariableAnnotation(node) {
  let current = node.parent;
  while (current) {
    if (current.type === "VariableDeclarator") return true;
    if (FUNCTION_TYPES.has(current.type)) return false;
    current = current.parent;
  }
  return false;
}

/** @type {import("eslint").Rule.RuleModule} */
export const maxMethodsPerClass = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Limita el número de métodos de una clase para evitar clases con varias responsabilidades.",
    },
    schema: [
      {
        type: "object",
        properties: { max: { type: "integer", minimum: 1 } },
        additionalProperties: false,
      },
    ],
    messages: {
      tooMany:
        "La clase {{name}} tiene {{count}} métodos; el máximo es {{max}}. Extrae una responsabilidad a otra clase o a funciones con nombre.",
    },
  },
  create(context) {
    const { max = 10 } = context.options[0] ?? {};
    return {
      ClassBody(node) {
        const methods = node.body.filter(
          (member) =>
            member.type === "MethodDefinition" ||
            member.type === "TSAbstractMethodDefinition" ||
            (member.type === "PropertyDefinition" &&
              member.value &&
              FUNCTION_TYPES.has(member.value.type)),
        );
        if (methods.length <= max) return;
        context.report({
          node,
          messageId: "tooMany",
          data: { name: node.parent?.id?.name ?? "anónima", count: methods.length, max },
        });
      },
    };
  },
};

/** @type {import("eslint").Rule.RuleModule} */
export const noUnknownOutsideNarrowing = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prohíbe `unknown` salvo en parámetros de type guards, en catch y en la anotación de una variable del borde.",
    },
    schema: [],
    messages: {
      banned:
        "`unknown` solo se permite en el parámetro de un type guard, en un catch o en la anotación de una variable del borde (`const raw: unknown = await request.json()`), y siempre se estrecha antes de usarse. Escribe un guard que devuelva el tipo real (value is T).",
    },
  },
  create(context) {
    return {
      TSUnknownKeyword(node) {
        if (isTypeGuard(enclosingFunction(node))) return;
        if (isCatchParameter(node)) return;
        if (isBoundaryVariableAnnotation(node)) return;
        context.report({ node, messageId: "banned" });
      },
    };
  },
};

export default {
  rules: {
    "max-methods-per-class": maxMethodsPerClass,
    "no-unknown-outside-narrowing": noUnknownOutsideNarrowing,
  },
};
