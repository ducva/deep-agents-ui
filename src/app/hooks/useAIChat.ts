import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { useStream } from "@langchain/langgraph-sdk/react";
import { type Message } from "@langchain/langgraph-sdk";
import { getDeployment } from "@/lib/environment/deployments";
import { v4 as uuidv4 } from "uuid";
import type { TodoItem } from "../types/types";
import { createClient } from "@/lib/client";
import { useAuthContext } from "@/providers/Auth";
import { 
  AISDKError,
  InvalidArgumentError
} from "ai";
import { getCurrentAgentParameters } from "@/lib/agents";

type StateType = {
  messages: Message[];
  todos: TodoItem[];
  files: Record<string, string>;
};

/**
 * Enhanced chat hook using AI SDK 5.0 patterns while maintaining LangGraph compatibility
 * 
 * This hook combines:
 * - LangGraph SDK streaming capabilities for agent communication
 * - AI SDK 5.0 message handling, error management, and type safety
 * - Enhanced retry logic and error handling from AI SDK
 */
export function useAIChat(
  threadId: string | null,
  setThreadId: (
    value: string | ((old: string | null) => string | null) | null,
  ) => void,
  onTodosUpdate: (todos: TodoItem[]) => void,
  onFilesUpdate: (files: Record<string, string>) => void,
) {
  const deployment = useMemo(() => getDeployment(), []);
  const { session } = useAuthContext();
  const accessToken = session?.accessToken;
  
  // AI SDK enhanced error state
  const [error, setError] = useState<AISDKError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const agentId = useMemo(() => {
    if (!deployment?.agentId) {
      throw new InvalidArgumentError({
        message: `No agent ID configured in environment`,
        parameter: "agentId",
        value: deployment?.agentId
      });
    }
    return deployment.agentId;
  }, [deployment]);

  const handleUpdateEvent = useCallback(
    (data: { [node: string]: Partial<StateType> }) => {
      try {
        Object.entries(data).forEach(([_, nodeData]) => {
          if (nodeData?.todos) {
            onTodosUpdate(nodeData.todos);
          }
          if (nodeData?.files) {
            onFilesUpdate(nodeData.files);
          }
        });
        // Clear error on successful update
        if (error) {
          setError(null);
          setRetryCount(0);
        }
      } catch (err) {
        const aiError = err instanceof AISDKError 
          ? err 
          : new AISDKError({
              name: "UpdateEventError",
              message: `Failed to process update event: ${err instanceof Error ? err.message : String(err)}`,
              cause: err instanceof Error ? err : undefined
            });
        setError(aiError);
      }
    },
    [onTodosUpdate, onFilesUpdate, error],
  );

  const stream = useStream<StateType>({
    assistantId: agentId,
    client: createClient(accessToken || ""),
    reconnectOnMount: true,
    threadId: threadId ?? null,
    onUpdateEvent: handleUpdateEvent,
    onThreadId: setThreadId,
    defaultHeaders: {
      "x-auth-scheme": "langsmith",
    },
  });

  // Enhanced message sending with AI SDK patterns
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message?.trim()) {
        const error = new InvalidArgumentError({
          message: "Message cannot be empty",
          parameter: "message",
          value: message
        });
        setError(error);
        return;
      }

      try {
        setError(null);
        
        // Create abort controller for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        // Get current agent parameters
        const agentParameters = getCurrentAgentParameters();
        
        // Create the message content, including agent parameters if this is the first message
        let messageContent = message;
        if (agentParameters && Object.keys(agentParameters).length > 0) {
          // Check if this is likely the first message of a new conversation
          const isFirstMessage = !stream.messages || stream.messages.length === 0;
          if (isFirstMessage) {
            // Include agent parameters in the first message
            messageContent = `${message}\n\n[Agent Parameters: ${JSON.stringify(agentParameters)}]`;
          }
        }

        const humanMessage: Message = {
          id: uuidv4(),
          type: "human",
          content: messageContent,
        };

        // Submit through LangGraph stream (maintaining existing functionality)
        await stream.submit(
          { messages: [humanMessage] },
          {
            optimisticValues(prev) {
              const prevMessages = prev.messages ?? [];
              const newMessages = [...prevMessages, humanMessage];
              return { ...prev, messages: newMessages };
            },
            config: {
              recursion_limit: 100,
            },
          },
        );

        // Reset retry count on successful send
        setRetryCount(0);

      } catch (err) {
        // Enhanced error handling using AI SDK error types
        let aiError: AISDKError;
        
        if (err instanceof AISDKError) {
          aiError = err;
        } else if (err instanceof Error) {
          if (err.name === 'AbortError') {
            // Don't treat abort as an error
            return;
          }
          aiError = new AISDKError({
            name: "SendMessageError",
            message: `Failed to send message: ${err.message}`,
            cause: err
          });
        } else {
          aiError = new AISDKError({
            name: "UnknownSendError",
            message: `An unknown error occurred while sending message: ${String(err)}`
          });
        }

        setError(aiError);
        setRetryCount(prev => prev + 1);
      }
    },
    [stream, retryCount],
  );

  // Enhanced stop functionality with abort controller
  const stopStream = useCallback(() => {
    try {
      // Cancel any ongoing request
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        abortControllerRef.current.abort();
      }
      
      // Stop the LangGraph stream
      stream.stop();
      
      // Clear any errors
      setError(null);
    } catch (err) {
      const aiError = new AISDKError({
        name: "StopStreamError",
        message: `Failed to stop stream: ${err instanceof Error ? err.message : String(err)}`,
        cause: err instanceof Error ? err : undefined
      });
      setError(aiError);
    }
  }, [stream]);

  // Retry functionality with exponential backoff
  const retry = useCallback(async () => {
    if (retryCount >= 3) {
      const error = new AISDKError({
        name: "MaxRetriesExceeded",
        message: "Maximum retry attempts exceeded"
      });
      setError(error);
      return;
    }

    // Exponential backoff
    const delay = Math.pow(2, retryCount) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    setRetryCount(prev => prev + 1);
    setError(null);
  }, []); // Remove retryCount from dependencies to avoid recreating function

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Core functionality (maintains compatibility)
    messages: stream.messages,
    isLoading: stream.isLoading,
    sendMessage,
    stopStream,
    
    // Enhanced AI SDK features
    error,
    retry,
    canRetry: retryCount < 3 && error !== null,
    retryCount,
  };
}