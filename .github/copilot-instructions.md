# Deep Agents UI

Deep Agents UI is a Next.js 15 React application that provides a web interface for interacting with LangChain/LangGraph AI agents. It uses TypeScript, React 19, Tailwind CSS 4, and SCSS modules for styling.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Environment Setup
- Requires Node.js (tested with v20.19.4) and npm (tested with v10.8.2)
- Install dependencies: `npm install` -- takes 2+ minutes to complete. NEVER CANCEL. Set timeout to 180+ seconds.
- Create environment configuration file `.env.local` with required variables:
```env
NEXT_PUBLIC_DEPLOYMENT_URL="http://127.0.0.1:2024"
NEXT_PUBLIC_AGENT_ID=<your agent ID>
NEXT_PUBLIC_LANGSMITH_API_KEY=<your API key>
```

### Development Workflow
- Start development server: `npm run dev` -- starts in 1 second, runs on http://localhost:3000
- CRITICAL: The development server works reliably and should be used for all testing and validation.
- Always test your changes in development mode before attempting production builds.

### Build Process
- Production build: `npm run build` -- FAILS due to network restrictions and linting errors
- BUILD ISSUE: Google Fonts import in `src/app/layout.tsx` fails due to network access restrictions (ENOTFOUND fonts.googleapis.com)
- BUILD ISSUE: ESLint errors prevent successful build due to TypeScript strict mode violations (multiple 'any' types)
- BUILD ISSUE: Missing Suspense boundary for useSearchParams from nuqs library
- Production server: `npm run start` (only works after successful build)

### Linting and Code Quality  
- Run linting: `npm run lint` -- FAILS due to TypeScript strict mode violations
- LINTING ISSUES: Multiple files use 'any' types which violate @typescript-eslint/no-explicit-any
- LINTING ISSUES: Unused imports and missing dependency warnings in useEffect hooks
- SCSS DEPRECATION: @import statements in SCSS files are deprecated, use @use instead

## Validation

### Manual Testing Requirements
- ALWAYS manually test changes by running `npm run dev` and navigating to http://localhost:3000
- ALWAYS test the chat interface by typing a message and pressing Enter
- Verify the UI loads with proper layout: left sidebar with Tasks/Files tabs, main chat area, message input
- Expected behavior: Message input should accept text, show "Working..." when submitted, and display connection errors if no backend server is available
- NEVER consider changes complete without manual UI validation

### Complete Validation Workflow
1. Create `.env.local` file with environment variables (see Environment Setup section)
2. Run `npm run dev` and wait for "Ready in ~1000ms" message
3. Navigate browser to http://localhost:3000
4. Verify page loads with title "Deep Agents" 
5. Verify left sidebar shows "Workspace" with Tasks/Files tabs
6. Verify main area shows "Deep Agents" heading and message input
7. Type a test message in the text input field
8. Press Enter to submit message
9. Verify message appears in chat history with user avatar
10. Verify "Working..." status appears with assistant avatar
11. Verify connection error messages in browser console (expected when no backend)
12. Verify input field is disabled during processing
13. Verify Stop button appears during processing

### Application Architecture Validation
- Verify environment variables are properly loaded by checking browser developer tools
- Test responsive design by resizing the browser window  
- Verify component interactions: sidebar toggle, tab switching, message sending
- Check for console errors that might indicate broken functionality
- Ensure Tailwind CSS classes are working (check element styles in dev tools)

## Common Tasks

### Key Project Structure
```
src/
├── app/
│   ├── components/          # React components
│   │   ├── ChatInterface/   # Main chat interface
│   │   ├── ChatMessage/     # Individual message display
│   │   ├── TasksFilesSidebar/ # Left sidebar with tasks and files
│   │   └── [other components]
│   ├── hooks/              # Custom React hooks
│   │   └── useChat.ts      # Chat functionality hook
│   ├── providers/          # React context providers
│   │   └── Auth.tsx        # Authentication provider
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── layout.tsx          # Root layout component
│   └── page.tsx           # Home page component
├── lib/                   # Library code
│   ├── client.ts          # LangGraph SDK client
│   └── environment/       # Environment configuration
└── providers/             # Additional providers
```

### Package.json Scripts
```json
{
  "dev": "next dev --turbopack",     // Development server with Turbopack
  "build": "next build",             // Production build (FAILS)  
  "start": "next start",             // Production server
  "lint": "next lint"                // ESLint linting (FAILS)
}
```

### Critical Configuration Files
- `next.config.ts` - Next.js configuration (minimal setup)
- `tailwind.config.js` - Tailwind CSS 4 configuration  
- `tsconfig.json` - TypeScript configuration with strict mode
- `eslint.config.mjs` - ESLint configuration with TypeScript rules
- `package.json` - Dependencies and scripts

### Environment Variables  
- `NEXT_PUBLIC_DEPLOYMENT_URL` - LangGraph server URL (defaults to http://127.0.0.1:2024)
- `NEXT_PUBLIC_AGENT_ID` - Agent identifier (defaults to "deepagent")  
- `NEXT_PUBLIC_LANGSMITH_API_KEY` - LangSmith API key for authentication

## Known Issues and Workarounds

### Build Failures
- **Google Fonts Network Error**: Import of Inter font fails due to network restrictions
  - Workaround: Remove font import from layout.tsx for offline builds
  - File: `src/app/layout.tsx` lines 2, 8, 22
- **ESLint TypeScript Errors**: Multiple files use 'any' types violating strict rules
  - Workaround: Add `eslint: { ignoreDuringBuilds: true }` to next.config.ts
- **Suspense Boundary Missing**: useSearchParams needs Suspense wrapper
  - Workaround: Wrap page content in Suspense component in layout.tsx

### SCSS Deprecation Warnings
- @import statements in SCSS modules are deprecated
- Affects: `src/app/components/TasksFilesSidebar/TasksFilesSidebar.module.scss`
- Warning: "Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0"

### Runtime Behavior
- Application requires a running LangGraph server for full functionality
- Without backend server, UI will show connection errors but interface remains functional
- Authentication uses environment variables, not real auth flow

## Dependencies and Technology Stack

### Core Framework
- **Next.js 15.4.6** - React framework with App Router
- **React 19.1.0** - UI library  
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **Sass 1.90.0** - CSS preprocessor for SCSS modules

### AI/ML Integration
- **@langchain/langgraph-sdk 0.0.105** - LangGraph client SDK
- **@langchain/core 0.3.68** - LangChain core functionality

### UI Components  
- **@radix-ui/react-*** - Unstyled, accessible UI primitives
- **lucide-react 0.539.0** - Icon library
- **react-markdown 10.1.0** - Markdown rendering
- **react-syntax-highlighter 15.6.1** - Code syntax highlighting

### State Management
- **nuqs 2.4.3** - URL state management (requires Suspense boundary)

### Development Tools
- **ESLint 9** with TypeScript support
- **Prettier 3.6.2** - Code formatting
- **Turbopack** - Fast development bundler (via Next.js --turbopack flag)

## Troubleshooting

### If Development Server Won't Start
1. Ensure Node.js v20+ is installed
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` with 120+ second timeout
4. Check for port conflicts on localhost:3000

### If Build Continues to Fail
1. This is expected due to network and linting restrictions
2. Use development server for all testing and validation
3. Focus changes on functionality rather than build process fixes
4. Document any build-related changes needed for deployment

### If UI Doesn't Load Properly
1. Check browser developer tools for JavaScript errors
2. Verify .env.local file exists with required environment variables
3. Ensure development server shows "Ready" status
4. Try hard refresh (Ctrl/Cmd + Shift + R)

Remember: Always use `npm run dev` for development and testing. The build process has known issues that prevent production deployment without additional configuration changes.