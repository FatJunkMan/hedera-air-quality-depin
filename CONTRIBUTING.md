# Contributing to Hedera Air Quality DePIN

Thank you for considering contributing to this project! 

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node version, etc.)
- Screenshots if applicable

### Suggesting Features

Feature requests are welcome! Please:
- Check existing issues first
- Provide clear use case
- Explain why this would be valuable
- Consider implementation approach

### Pull Requests

1. **Fork the repository**
2. **Create a branch**: `git checkout -b feature/YourFeature`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit**: `git commit -m 'Add YourFeature'`
6. **Push**: `git push origin feature/YourFeature`
7. **Create Pull Request**

### Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/hedera-air-quality-depin.git
cd hedera-air-quality-depin

# Install dependencies
cd backend && npm install
cd ../contracts && npm install

# Create .env files (see README.md)
```

### Code Style

- Use meaningful variable names
- Add comments for complex logic
- Follow existing code patterns
- Keep functions focused and small
- Use async/await for promises

### Testing

Before submitting PR:
- Test contract deployment
- Test sensor registration
- Test reading submission
- Test email alerts
- Verify ESP32 functionality

### Commit Messages

Use clear, descriptive commit messages:
- `feat: Add temperature threshold alerts`
- `fix: Resolve sensor I2C connection issue`
- `docs: Update API endpoint documentation`
- `refactor: Simplify reading submission logic`

## Areas We Need Help

- [ ] Additional sensor support (MQ series, BME680, etc.)
- [ ] Mobile app development
- [ ] Data visualization dashboard
- [ ] Multi-language support
- [ ] Unit tests and integration tests
- [ ] Performance optimizations
- [ ] Documentation improvements
- [ ] Smart Home integrations with smart assistants (Alexa,Siri,Google,etc.)

## Questions?

Feel free to open an issue for any questions or discussions!

## Code of Conduct

Be respectful and constructive in all interactions.


Thank you for contributing!
