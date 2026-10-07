// Configuration ESLint : repère les erreurs courantes dans le code.
const expoConfig = require('eslint-config-expo/flat');

module.exports = [...expoConfig, { ignores: ['dist/*', 'node_modules/*'] }];
