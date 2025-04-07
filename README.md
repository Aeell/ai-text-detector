# AI Text Detector

A modern web application for detecting AI-generated text using advanced natural language processing techniques. The application provides multilingual support and features an accessible, responsive user interface.

## Features

- 🤖 Advanced AI text detection
- 🌐 Multilingual support
- 📊 Detailed analysis metrics
- 🔄 Text comparison functionality
- 🎨 Modern, responsive UI
- ♿ Comprehensive accessibility features
- 🌓 Light/Dark theme support
- 🔒 Privacy-focused design

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-text-detector.git
cd ai-text-detector
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be available in the `dist` directory.

## Project Structure

```
ai-text-detector/
├── src/
│   ├── assets/        # Static assets
│   ├── css/          # Stylesheets
│   ├── html/         # HTML templates
│   ├── js/           # JavaScript modules
│   │   ├── models/   # Data models
│   │   ├── services/ # Services
│   │   └── utils/    # Utilities
│   └── locales/      # Translation files
├── dist/             # Built files
├── tests/            # Test files
└── package.json      # Project configuration
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code
- `npm run analyze` - Analyze bundle size

### Code Style

This project uses ESLint and Prettier for code formatting and maintains consistent coding standards. The configuration can be found in `.eslintrc.json`.

## Testing

Tests are written using Vitest. Run the test suite with:

```bash
npm run test
```

## Accessibility

The application is built with accessibility in mind and includes:

- ARIA labels and roles
- Keyboard navigation
- High contrast mode
- Font size controls
- Screen reader support
- Reduced motion support

## Browser Support

The application supports all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Natural.js for text processing
- Compromise for NLP functionality
- Marked for markdown processing
- DOMPurify for security
- Vite for build tooling
