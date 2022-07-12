module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['@galileo01/eslint-config-react-ts'],
  rules: {
    "no-param-reassign": [2, { "props": false }]
  }
}
