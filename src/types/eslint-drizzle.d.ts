declare module "eslint-plugin-drizzle" {
  import type { ESLint, Linter } from "eslint";

  const plugin: {
    configs: {
      recommended: Linter.Config;
      all: Linter.Config;
    };
    rules: ESLint.Plugin["rules"];
  };

  export default plugin;
}
