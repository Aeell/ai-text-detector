# Contributing to AI Text Detector

Thank you for considering contributing to the AI Text Detector project! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment information (browser, OS, etc.)

### Suggesting Features

We welcome feature suggestions! Please create an issue with:

- A clear, descriptive title
- Detailed description of the proposed feature
- Any relevant mockups or examples
- Why this feature would be useful to the project

### Pull Requests

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Ensure tests pass: `npm test`
5. Ensure code style checks pass: `npm run lint`
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to the branch: `git push origin feature/your-feature-name`
8. Submit a pull request

## Development Setup

1. Clone your fork of the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Run tests: `npm test`

## Project Structure

```
ai-text-detector/
├── src/                  # Source code
│   ├── js/               # JavaScript files
│   │   ├── models/       # Data models
│   │   ├── services/     # Service modules
│   │   └── utils/        # Utility functions
│   ├── css/              # Stylesheets
│   ├── html/             # HTML templates
│   └── locales/          # Translation files
├── tests/                # Test files
├── dist/                 # Build output (generated)
├── __mocks__/            # Test mocks
└── ...                   # Config files
```

## Coding Standards

- Follow the ESLint configuration in the project
- Write tests for new features
- Document new code with JSDoc comments
- Maintain existing code style

## Adding New Languages

1. Create a new locale file in `src/locales/` with the appropriate language code
2. Translate all strings in the file
3. Update the language list in the `LanguageManager` class

## Testing

- Write unit tests for all new functionality
- Ensure all existing tests pass
- Consider edge cases and error conditions

## Documentation

- Update README.md with any necessary information about new features
- Document functions and classes with JSDoc comments
- Keep inline comments up to date with code changes

## Release Process

The project maintainers will handle versioning and releases.

## Questions?

If you have any questions about contributing, please open an issue for discussion.

Thank you for contributing to AI Text Detector! 