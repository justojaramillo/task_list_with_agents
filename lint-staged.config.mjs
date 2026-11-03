/**
 * lint-staged: se ejecuta sobre lo que está en el índice antes de commitear.
 * El typecheck va completo porque tsc necesita el proyecto entero, no archivo a archivo.
 */
const lintStagedConfig = {
  "*.{ts,tsx}": ["eslint --fix", () => "npx tsc --noEmit"],
};

export default lintStagedConfig;
