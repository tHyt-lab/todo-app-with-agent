# Todo App

[![CI](https://github.com/YOUR_USERNAME/todo-app/workflows/CI/badge.svg)](https://github.com/YOUR_USERNAME/todo-app/actions)
[![PR Checks](https://github.com/YOUR_USERNAME/todo-app/workflows/PR%20Checks/badge.svg)](https://github.com/YOUR_USERNAME/todo-app/actions)

A modern Todo application built with React + TypeScript + Vite.

## 🚀 Features

- ⚡️ Built with Vite for fast development
- 🔧 TypeScript for type safety
- 🎨 Material-UI for beautiful components
- 🧪 Comprehensive testing with Vitest
- 📊 Test coverage reporting
- 🔍 ESLint + Biome for code quality
- 🔄 GitHub Actions CI/CD

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

```bash
npm run dev
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:run

# Generate coverage report
npm run test:coverage
```

## 🔧 Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Format code
npm run format

# Type checking
npm run type-check
```

## 🏗️ Build

```bash
npm run build
```

## 📋 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Generate test coverage
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Biome
- `npm run format:check` - Check formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run ci` - Run all CI checks locally

## 🔄 CI/CD

This project uses GitHub Actions for continuous integration:

- **CI Workflow**: Runs on push and PR to main/develop branches
  - Linting with ESLint and Biome
  - Type checking with TypeScript
  - Unit tests with Vitest
  - Build verification
  - Multiple Node.js versions (18.x, 20.x)

- **PR Checks**: Additional checks for pull requests
  - Test coverage reporting
  - Automated PR comments with results

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
