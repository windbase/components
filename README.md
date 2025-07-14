# Windbase Components

A web-based TailwindCSS visual builder for creating and sharing components with the community.

## Features

- 🎨 **Visual Component Builder**: Create and edit components with a clean, modern interface
- 📦 **Component Library**: Browse and manage blocks and templates
- 🔍 **Live Preview**: Preview components in a new window with TailwindCSS
- 📋 **Copy to Clipboard**: Easy copying of component HTML code
- 🏷️ **Tagging System**: Organize components with tags
- 🚀 **Build System**: Generate distribution files for CDN deployment
- 📱 **Responsive Design**: Built with modern UI components from shadcn/ui

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime
- Node.js 18+ (for compatibility)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/windbase/components.git
cd components
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Creating Components

1. Click the "New Component" button
2. Fill in the component details:
   - **Name**: Display name for your component
   - **Type**: Choose between "Blocks" or "Templates"
   - **Author**: Your name or organization
   - **Tags**: Comma-separated tags (e.g., "header, hero, call-to-action")
   - **HTML Code**: Your TailwindCSS component code

3. Click "Create" to save your component

### Editing Components

1. Find your component in the component grid
2. Hover over the component card to reveal action buttons
3. Click the edit icon (pencil) to modify the component
4. Make your changes and click "Update"

### Managing Components

- **Preview**: Click the eye icon to preview the component in a new window
- **Copy Code**: Click the copy icon to copy the HTML code to your clipboard
- **Delete**: Click the trash icon to remove a component

### Building for Production

Generate distribution files for deployment:

```bash
bun run build:components
```

This creates a `dist/` folder with:
- `blocks.json` - Metadata for all block components
- `templates.json` - Metadata for all template components
- `blocks/` - HTML files for each block component
- `templates/` - HTML files for each template component

## Project Structure

```
components/
├── contents/                 # Source components
│   ├── blocks/              # Block components
│   │   └── component-name/
│   │       ├── index.html   # Component HTML
│   │       └── metadata.json # Component metadata
│   └── templates/           # Template components
├── dist/                    # Generated distribution files
│   ├── blocks.json         # Block metadata
│   ├── templates.json      # Template metadata
│   ├── blocks/             # Block HTML files
│   └── templates/          # Template HTML files
└── src/                    # Application source code
    ├── components/         # React components
    ├── hooks/             # Custom hooks
    ├── types/             # TypeScript types
    └── utils/             # Utility functions
```

## Component Metadata

Each component includes metadata in `metadata.json`:

```json
{
  "id": "component-id",
  "name": "Component Name",
  "tags": ["tag1", "tag2", "tag3"],
  "author": "Author Name"
}
```

## Scripts

- `bun run dev` - Start development server
- `bun run build` - Build the application
- `bun run build:components` - Generate component distribution files
- `bun run start` - Start production server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your components or improvements
4. Submit a pull request

## CDN Deployment

The `dist/` folder is designed to be deployed to GitHub Pages or any CDN. After building, you can access components via:

- `https://your-domain.com/blocks/component-id.html`
- `https://your-domain.com/templates/component-id.html`
- `https://your-domain.com/blocks.json`
- `https://your-domain.com/templates.json`

## Tech Stack

- **Runtime**: Bun
- **Framework**: React 19
- **Styling**: TailwindCSS 4
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod
- **Build System**: Custom build script

## License

MIT License - feel free to use this project for your own component libraries!
