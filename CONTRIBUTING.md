# Contributing to Lash Bot

Thank you for your interest in contributing to Lash Bot! This document provides guidelines and instructions for contributing to the project.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Description**: A clear description of the problem
- **Reproduction steps**: Steps to reproduce the behavior
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: OS, Python version, Node.js version
- **Screenshots**: If applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:

- Use a clear and descriptive title
- Provide a detailed description of the suggested enhancement
- Explain why this enhancement would be useful
- Provide examples of how the enhancement would be used

### Pull Requests

1. **Fork the repository**
2. **Create a branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Commit your changes**: `git commit -m 'Add some feature'`
5. **Push to the branch**: `git push origin feature/your-feature-name`
6. **Open a Pull Request**

### Code Style

- **Python**: Follow PEP 8 guidelines
- **JavaScript/React**: Use ESLint configuration
- **Comments**: Add comments for complex logic
- **Variable names**: Use descriptive names

### Commit Messages

Use clear and descriptive commit messages:

```
feat: Add calendar component to Mini App
fix: Resolve booking time slot conflict
docs: Update deployment instructions
style: Format code according to PEP 8
refactor: Simplify database queries
test: Add unit tests for booking API
chore: Update dependencies
```

## Development Setup

### Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Fill in your values in .env

# Run bot
python bot.py

# Run API server
uvicorn api.app:app --reload
```

### Frontend

```bash
cd mini-app

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run build
```

## Testing

Before submitting a PR, ensure:

- [ ] Code follows the project style guidelines
- [ ] All tests pass (if tests exist)
- [ ] Documentation is updated if needed
- [ ] No console errors or warnings
- [ ] Changes work on both development and production

## Questions?

If you have questions, feel free to open an issue or contact the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
