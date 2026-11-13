const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
module.exports = defineConfig([
  { ignores: ['exports/**', 'tools/**', 'stich-design/**', 'venv/**', 'backend/**'] },
  expoConfig,
]);
