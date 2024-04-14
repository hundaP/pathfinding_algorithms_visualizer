import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

export default [
  {
    languageOptions: { 
      globals: {
        ...globals.browser,
        self: "writable"
      }
    },
    rules: {
      "import/no-webpack-loader-syntax": "off"
    }
  },
  pluginJs.configs.recommended,
  pluginReactConfig,
];