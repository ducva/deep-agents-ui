# AI SDK 5.0 Integration

This document describes the integration of Vercel's AI SDK 5.0 into the Deep Agents UI application.

## Overview

The AI SDK 5.0 integration enhances the existing LangGraph functionality with:

- **Enhanced Error Handling**: Better error categorization and user-friendly error messages
- **Retry Logic**: Automatic retry with exponential backoff for transient failures  
- **Type Safety**: Improved TypeScript types and error handling patterns
- **Request Cancellation**: Proper cleanup and abort controller support
- **Development Features**: Enhanced debugging and error reporting

## Architecture

### Dual Hook Approach

The integration maintains backward compatibility while adding enhanced features:

```typescript
// Original hook - still available for compatibility
import { useChat } from './hooks/useChat';

// Enhanced AI SDK hook - with additional features
import { useAIChat } from './hooks/useChat';
```

### Feature Toggle

The enhanced features are enabled automatically in development mode or when `VITE_ENABLE_AI_SDK=true`:

```typescript
const useEnhancedAI = process.env.NODE_ENV === 'development' || 
                      import.meta.env.VITE_ENABLE_AI_SDK === 'true';
```

## New Components

### AIErrorBoundary

A sophisticated error handling component that:
- Categorizes errors by severity (low/medium/high)
- Provides contextual error messages
- Offers retry functionality with progress tracking
- Shows technical details in development mode

```tsx
<AIErrorBoundary
  error={error}
  onRetry={retry}
  canRetry={canRetry}
  retryCount={retryCount}
  maxRetries={3}
/>
```

## Enhanced Features

### Error Types

The integration leverages AI SDK's comprehensive error types:

- `InvalidArgumentError`: Parameter validation errors
- `LoadAPIKeyError`: Authentication failures  
- `APICallError`: Network communication issues
- `RetryError`: Multiple retry attempts failed
- `AISDKError`: Base error class with enhanced metadata

### Retry Logic

Automatic retry with exponential backoff:
- Maximum 3 retry attempts
- Exponential backoff: 1s, 2s, 4s delays
- User can manually trigger retries
- Progress indication for retry attempts

### Request Cancellation

Proper cleanup and cancellation:
- AbortController integration
- Automatic cleanup on component unmount
- Manual cancellation via stop functionality

## Usage

### Basic Usage (Backward Compatible)

```typescript
const { messages, isLoading, sendMessage, stopStream } = useChat(
  threadId,
  setThreadId,
  onTodosUpdate,
  onFilesUpdate
);
```

### Enhanced Usage

```typescript
const { 
  messages, 
  isLoading, 
  sendMessage, 
  stopStream,
  // AI SDK enhancements
  error,
  retry,
  canRetry,
  retryCount
} = useAIChat(
  threadId,
  setThreadId,
  onTodosUpdate,
  onFilesUpdate
);
```

## Configuration

### Environment Variables

```env
# Optional: Enable AI SDK features in production
VITE_ENABLE_AI_SDK=true

# Existing LangGraph configuration
VITE_DEPLOYMENT_URL="http://127.0.0.1:2024"
VITE_AGENT_ID="deepagent"
VITE_LANGSMITH_API_KEY=""
```

## Benefits

1. **Better User Experience**: Clear error messages and recovery options
2. **Improved Reliability**: Automatic retry for transient failures
3. **Enhanced Debugging**: Better error reporting and technical details
4. **Future-Proof**: Foundation for additional AI SDK features
5. **Backward Compatibility**: Existing functionality remains unchanged

## Migration Path

The integration is designed for gradual adoption:

1. **Phase 1** (Current): Enhanced features available alongside existing functionality
2. **Phase 2** (Future): Gradually migrate components to enhanced version
3. **Phase 3** (Future): Full migration to AI SDK patterns

## Technical Details

### Dependencies Added

```json
{
  "dependencies": {
    "ai": "^5.0.15"
  }
}
```

### Files Modified

- `src/app/hooks/useChat.ts` - Added enhanced hook export
- `src/app/hooks/useAIChat.ts` - New enhanced hook implementation
- `src/lib/client.ts` - Enhanced client utilities
- `src/lib/aiClient.ts` - New AI SDK enhanced client
- `src/app/components/ChatInterface/ChatInterface.tsx` - Enhanced error handling
- `src/app/components/AIErrorBoundary/` - New error boundary component

### Bundle Impact

The AI SDK adds approximately 65KB to the bundle size, providing significant value through enhanced error handling, retry logic, and improved developer experience.