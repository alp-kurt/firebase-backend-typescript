module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
  },
  extends: ["eslint:recommended"],
  rules: {
    "no-unused-vars": "off"
  }
};
