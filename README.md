# Todo App

[![CI](https://github.com/thyt-lab/todo-app-with-agent/workflows/CI/badge.svg)](https://github.com/thyt-lab/todo-app-with-agent/actions)
[![PR Checks](https://github.com/thyt-lab/todo-app-with-agent/workflows/PR%20Checks/badge.svg)](https://github.com/thyt-lab/todo-app-with-agent/actions)
[![Deploy](https://github.com/thyt-lab/todo-app-with-agent/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)](https://github.com/thyt-lab/todo-app-with-agent/actions)

A modern Todo application built with React + TypeScript + Vite.

🌐 **Live Demo**: [https://thyt-lab.github.io/todo-app-with-agent/](https://thyt-lab.github.io/todo-app-with-agent/)

## 🚀 Features

- ⚡️ Built with Vite for fast development
- 🔧 TypeScript for type safety
- 🎨 Material-UI for beautiful components
- 🧪 Comprehensive testing with Vitest
- 📊 Test coverage reporting
- 🔍 Biome for code quality and formatting
- 🔄 GitHub Actions CI/CD
- 🌐 Automatic deployment to GitHub Pages

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

## 🚀 Deployment

This project automatically deploys to GitHub Pages when a new release is published.

### Manual Deployment

You can also trigger a manual deployment by:

1. Go to Actions tab in your GitHub repository
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

### Setup GitHub Pages

1. Go to your repository Settings
2. Navigate to Pages section
3. Set Source to "GitHub Actions"
4. The app will be available at `https://your-username.github.io/todo-app-with-agent/`

## 🔖 Release Process

This project uses automated release management with semantic versioning.

### 📝 Creating a Release

1. **Automatic Draft Creation**: Release drafts are automatically created when PRs are merged to `main`
2. **Semantic Versioning**: Releases follow semantic versioning (MAJOR.MINOR.PATCH)
3. **Label-based Versioning**: Version increments are determined by PR labels:
   - `major` or `breaking`: Major version bump (1.0.0 → 2.0.0)
   - `minor` or `feature`: Minor version bump (1.0.0 → 1.1.0)
   - `patch`, `bug`, `bugfix`, `chore`: Patch version bump (1.0.0 → 1.0.1)

### 🏷️ PR Labels

Add appropriate labels to your PRs for proper categorization:

- **🚀 Features**: `feature`, `enhancement`
- **🐛 Bug Fixes**: `bug`, `bugfix`
- **🧹 Maintenance**: `chore`, `dependencies`
- **📚 Documentation**: `documentation`
- **🔧 Refactoring**: `refactor`
- **⚡ Performance**: `performance`
- **🔒 Security**: `security`

### 📖 Release Notes

Release notes are automatically generated and include:
- Categorized changelog based on PR labels
- Links to related PRs and contributors
- Installation and quick start instructions
- Link to live demo

### 🚀 Publishing a Release

1. Go to the [Releases page](../../releases)
2. Edit the automatically created draft
3. Review the generated release notes
4. Click "Publish release"
5. The app will automatically deploy to GitHub Pages

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
