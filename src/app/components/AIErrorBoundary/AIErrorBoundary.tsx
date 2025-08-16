import React from "react";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AISDKError } from "ai";
import styles from "./AIErrorBoundary.module.scss";

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

  return (
    <div className={`${styles.errorBoundary} ${styles[severity]}`} role="alert" aria-live="polite">
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}>
          <AlertCircle size={20} />
        </div>
        
        <div className={styles.errorDetails}>
          <div className={styles.errorTitle}>
            {error.name || 'Error'}
          </div>
          
          <div className={styles.errorMessage}>
            {description}
          </div>
          
          {process.env.NODE_ENV === 'development' && error.message && (
            <details className={styles.errorDebug}>
              <summary>Technical Details</summary>
              <pre>{error.message}</pre>
            </details>
          )}
          
          {retryCount > 0 && (
            <div className={styles.retryInfo}>
              Retry attempt {retryCount} of {maxRetries}
            </div>
          )}
        </div>
        
        <div className={styles.errorActions}>
          {showRetryButton && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className={styles.retryButton}
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
              className={styles.dismissButton}
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