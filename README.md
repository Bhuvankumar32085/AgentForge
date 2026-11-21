# AgentForge - Frontend

React + TypeScript frontend configured with Tailwind CSS v4 and shadcn/ui.

## Tech Stack
- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **UI Components:** shadcn/ui (Radix primitives)
- **Icons:** Lucide React
- **Fonts:** Geist Variable

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```

### 3. Build for production
```bash
npm run build
```

## Adding more shadcn/ui components

To add new shadcn components, run the following inside the `frontend` directory:

```bash
npx shadcn@latest add <component-name>
```

Examples:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add input
npx shadcn@latest add select
```
