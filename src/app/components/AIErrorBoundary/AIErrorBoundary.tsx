import React from "react";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AISDKError } from "ai";

interface AIErrorBoundaryProps {
  error: AISDKError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  canRetry?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

/**
 * Enhanced error boundary component that leverages AI SDK 5.0 error types
 * Provides better error categorization and retry strategies
 */
export const AIErrorBoundary: React.FC<AIErrorBoundaryProps> = ({
  error,
  onRetry,
  onDismiss,
  canRetry = false,
  retryCount = 0,
  maxRetries = 3
}) => {
  if (!error) return null;

  const getErrorSeverity = (error: AISDKError): 'low' | 'medium' | 'high' => {
    // Categorize errors based on AI SDK error types
    switch (error.name) {
      case 'InvalidArgumentError':
      case 'InvalidMessageRoleError':
      case 'InvalidPromptError':
        return 'medium';
      case 'APICallError':
      case 'RetryError':
      case 'NoContentGeneratedError':
        return 'high';
      case 'LoadAPIKeyError':
      case 'UnsupportedModelVersionError':
        return 'high';
      default:
        return 'medium';
    }
  };

  const getErrorDescription = (error: AISDKError): string => {
    switch (error.name) {
      case 'InvalidArgumentError':
        return 'There was an issue with the request parameters. Please check your input and try again.';
      case 'LoadAPIKeyError':
        return 'Authentication failed. Please check your API key configuration.';
      case 'APICallError':
        return 'Failed to communicate with the AI service. This might be a temporary issue.';
      case 'RetryError':
        return 'Multiple attempts failed. The service might be temporarily unavailable.';
      case 'NoContentGeneratedError':
        return 'The AI service didn\'t generate any response. Please try rephrasing your request.';
      default:
        return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
    }
  };

  const severity = getErrorSeverity(error);
  const description = getErrorDescription(error);
  const showRetryButton = canRetry && onRetry && retryCount < maxRetries;

  const getErrorClasses = (severity: string) => {
    const baseClasses = "border rounded-lg p-4 mb-4";
    const severityClasses: Record<string, string> = {
      low: "bg-blue-50 border-blue-200",
      medium: "bg-yellow-50 border-yellow-200", 
      high: "bg-red-50 border-red-200"
    };
    return `${baseClasses} ${severityClasses[severity] || severityClasses.high}`;
  };

  const getIconClasses = (severity: string) => {
    const severityIconClasses: Record<string, string> = {
      low: "text-blue-600",
      medium: "text-yellow-600",
      high: "text-red-600"
    };
    return severityIconClasses[severity] || severityIconClasses.high;
  };

  const getTitleClasses = (severity: string) => {
    const severityTitleClasses: Record<string, string> = {
      low: "text-blue-800",
      medium: "text-yellow-800", 
      high: "text-red-800"
    };
    return `font-semibold text-sm ${severityTitleClasses[severity] || severityTitleClasses.high}`;
  };

  return (
    <div className={getErrorClasses(severity)} role="alert" aria-live="polite">
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-0.5 ${getIconClasses(severity)}`}>
          <AlertCircle size={20} />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className={getTitleClasses(severity)}>
            {error.name || 'Error'}
          </div>
          
          <div className="text-sm text-gray-600">
            {description}
          </div>
          
          {process.env.NODE_ENV === 'development' && error.message && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer text-gray-500 hover:text-gray-700">Technical Details</summary>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto font-mono">{error.message}</pre>
            </details>
          )}
          
          {retryCount > 0 && (
            <div className="text-xs text-gray-500">
              Retry attempt {retryCount} of {maxRetries}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-1 flex-shrink-0">
          {showRetryButton && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Retry
            </Button>
          )}
          
          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="p-1"
            >
              <X size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

AIErrorBoundary.displayName = "AIErrorBoundary";