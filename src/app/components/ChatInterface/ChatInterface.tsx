
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  FormEvent,
} from "react";
import type { SubAgent, TodoItem, ToolCall, Agent } from "../../types/types";
import { useChat, useAIChat } from "../../hooks/useChat";
import { AISDKError } from "ai";
import { Message } from "@langchain/langgraph-sdk";
import { extractStringFromMessageContent } from "../../utils/utils";
import { Bot, FileText, Link, LoaderCircle, Paperclip, Send, SquarePen, X, History } from "lucide-react";
import { AgentSelector } from "../AgentSelector/AgentSelector";
import { Button } from "@/components/ui/button";
import { UserMenu } from "../UserMenu/UserMenu";
import { ThreadHistorySidebar } from "../ThreadHistorySidebar/ThreadHistorySidebar";
import { Input } from "@/components/ui/input";
import { AgentConfirmationDialog } from "../AgentConfirmationDialog/AgentConfirmationDialog";
import { AIErrorBoundary } from "../AIErrorBoundary/AIErrorBoundary";
import { ChatMessage } from "../ChatMessage/ChatMessage";
import styles from './ChatInterface.module.scss'

interface ChatInterfaceProps {
  threadId: string | null;
  selectedSubAgent: SubAgent | null;
  setThreadId: (
    value: string | ((old: string | null) => string | null) | null,
  ) => void;
  onSelectSubAgent: (subAgent: SubAgent) => void;
  onTodosUpdate: (todos: TodoItem[]) => void;
  onFilesUpdate: (files: Record<string, string>) => void;
  onNewThread: () => void;
  isLoadingThreadState: boolean;
}

export const ChatInterface = React.memo<ChatInterfaceProps>(
  ({
    threadId,
    selectedSubAgent,
    setThreadId,
    onSelectSubAgent,
    onTodosUpdate,
    onFilesUpdate,
    onNewThread,
    isLoadingThreadState,
  }) => {
    const [input, setInput] = useState("");
    const [isThreadHistoryOpen, setIsThreadHistoryOpen] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [attachedLinks, setAttachedLinks] = useState<string[]>([]);
    const [linkInput, setLinkInput] = useState("");
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [selectedAgentForConfirmation, setSelectedAgentForConfirmation] = useState<Agent | null>(null);
    const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Use AI SDK enhanced features if enabled via environment variable
    const useEnhancedAI = process.env.NODE_ENV === 'development' || 
                          import.meta.env.VITE_ENABLE_AI_SDK === 'true';
    
    // Always call both hooks to avoid conditional hook issues
    const originalChatResult = useChat(threadId, setThreadId, onTodosUpdate, onFilesUpdate);
    const enhancedChatResult = useAIChat(threadId, setThreadId, onTodosUpdate, onFilesUpdate);
    
    // Use enhanced version if enabled, otherwise use original
    const chatHookResult = useEnhancedAI ? enhancedChatResult : originalChatResult;
    
    const { 
      messages, 
      isLoading, 
      sendMessage, 
      stopStream
    } = chatHookResult;
    
    // Enhanced AI SDK features (only available when using useAIChat)
    const error = ('error' in chatHookResult ? chatHookResult.error : null) as AISDKError | null;
    const retry = ('retry' in chatHookResult ? chatHookResult.retry : undefined) as (() => void) | undefined;
    const canRetry = ('canRetry' in chatHookResult ? chatHookResult.canRetry : false) as boolean;
    const retryCount = ('retryCount' in chatHookResult ? chatHookResult.retryCount : 0) as number;

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = useCallback(
      (e: FormEvent) => {
        e.preventDefault();
        const messageText = input.trim();
        if (!messageText || isLoading) return;
        
        // TODO: Handle attached files and links in the message
        // For now, we'll include file names and links in the text message
        let fullMessage = messageText;
        
        if (attachedFiles.length > 0) {
          const fileNames = attachedFiles.map(file => file.name).join(', ');
          fullMessage += `\n\nAttached files: ${fileNames}`;
        }
        
        if (attachedLinks.length > 0) {
          fullMessage += `\n\nAttached links: ${attachedLinks.join(', ')}`;
        }
        
        sendMessage(fullMessage);
        setInput("");
        setAttachedFiles([]);
        setAttachedLinks([]);
        setShowLinkInput(false);
        setLinkInput("");
      },
      [input, isLoading, sendMessage, attachedFiles, attachedLinks],
    );

    const handleFileUpload = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        setAttachedFiles(prev => [...prev, ...Array.from(files)]);
      }
    }, []);

    const handleRemoveFile = useCallback((index: number) => {
      setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleAddLink = useCallback(() => {
      const trimmedLink = linkInput.trim();
      if (trimmedLink && !attachedLinks.includes(trimmedLink)) {
        setAttachedLinks(prev => [...prev, trimmedLink]);
        setLinkInput("");
        setShowLinkInput(false);
      }
    }, [linkInput, attachedLinks]);

    const handleRemoveLink = useCallback((index: number) => {
      setAttachedLinks(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleToggleLinkInput = useCallback(() => {
      setShowLinkInput(prev => !prev);
      if (!showLinkInput) {
        setLinkInput("");
      }
    }, [showLinkInput]);

    const handleNewThread = useCallback(() => {
      // Cancel any ongoing thread when creating new thread
      if (isLoading) {
        stopStream();
      }
      setIsThreadHistoryOpen(false);
      onNewThread();
    }, [isLoading, stopStream, onNewThread]);

    const handleThreadSelect = useCallback(
      (id: string) => {
        setThreadId(id);
        setIsThreadHistoryOpen(false);
      },
      [setThreadId],
    );

    const toggleThreadHistory = useCallback(() => {
      setIsThreadHistoryOpen((prev) => !prev);
    }, []);

    const handleAgentSelect = useCallback((agent: Agent) => {
      setSelectedAgentForConfirmation(agent);
      setIsAgentDialogOpen(true);
    }, []);

    const handleAgentConfirm = useCallback((parameters?: Record<string, any>) => {
      if (selectedAgentForConfirmation) {
        // Store the selected agent ID in environment
        // In a real app, you might need to update server configuration
        // For now, we'll update the environment variable and reload
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('agent', selectedAgentForConfirmation.id);
        
        // Store parameters in URL if provided
        if (parameters && Object.keys(parameters).length > 0) {
          currentUrl.searchParams.set('agentParams', JSON.stringify(parameters));
        } else {
          currentUrl.searchParams.delete('agentParams');
        }
        
        // Clear existing state before switching
        onNewThread();
        
        // Reload the page with the new agent parameter
        window.location.href = currentUrl.toString();
      }
      setIsAgentDialogOpen(false);
      setSelectedAgentForConfirmation(null);
    }, [selectedAgentForConfirmation, onNewThread]);

    const handleAgentCancel = useCallback(() => {
      setIsAgentDialogOpen(false);
      setSelectedAgentForConfirmation(null);
    }, []);

    const hasMessages = messages.length > 0;

    const processedMessages = useMemo(() => {
      /* 
    1. Loop through all messages
    2. For each AI message, add the AI message, and any tool calls to the messageMap
    3. For each tool message, find the corresponding tool call in the messageMap and update the status and output
    */
      const messageMap = new Map<string, any>();
      messages.forEach((message: Message) => {
        if (message.type === "ai") {
          const toolCallsInMessage: any[] = [];
          if (
            message.additional_kwargs?.tool_calls &&
            Array.isArray(message.additional_kwargs.tool_calls)
          ) {
            toolCallsInMessage.push(...message.additional_kwargs.tool_calls);
          } else if (message.tool_calls && Array.isArray(message.tool_calls)) {
            toolCallsInMessage.push(
              ...message.tool_calls.filter(
                (toolCall: any) => toolCall.name !== "",
              ),
            );
          } else if (Array.isArray(message.content)) {
            const toolUseBlocks = message.content.filter(
              (block: any) => block.type === "tool_use",
            );
            toolCallsInMessage.push(...toolUseBlocks);
          }
          const toolCallsWithStatus = toolCallsInMessage.map(
            (toolCall: any) => {
              const name =
                toolCall.function?.name ||
                toolCall.name ||
                toolCall.type ||
                "unknown";
              const args =
                toolCall.function?.arguments ||
                toolCall.args ||
                toolCall.input ||
                {};
              return {
                id: toolCall.id || `tool-${Math.random()}`,
                name,
                args,
                status: "pending" as const,
              } as ToolCall;
            },
          );
          messageMap.set(message.id!, {
            message,
            toolCalls: toolCallsWithStatus,
          });
        } else if (message.type === "tool") {
          const toolCallId = message.tool_call_id;
          if (!toolCallId) {
            return;
          }
          for (const [, data] of messageMap.entries()) {
            const toolCallIndex = data.toolCalls.findIndex(
              (tc: any) => tc.id === toolCallId,
            );
            if (toolCallIndex === -1) {
              continue;
            }
            data.toolCalls[toolCallIndex] = {
              ...data.toolCalls[toolCallIndex],
              status: "completed" as const,
              // TODO: Make this nicer
              result: extractStringFromMessageContent(message),
            };
            break;
          }
        } else if (message.type === "human") {
          messageMap.set(message.id!, {
            message,
            toolCalls: [],
          });
        }
      });
      const processedArray = Array.from(messageMap.values());
      return processedArray.map((data, index) => {
        const prevMessage =
          index > 0 ? processedArray[index - 1].message : null;
        return {
          ...data,
          showAvatar: data.message.type !== prevMessage?.type,
        };
      });
    }, [messages]);

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Bot className={styles.logo} />
            <h1 className={styles.title}>Deep Agents</h1>
          </div>
          <div className={styles.headerRight}>
            <AgentSelector onAgentSelect={handleAgentSelect} />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewThread}
              disabled={!hasMessages}
            >
              <SquarePen size={20} />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleThreadHistory}>
              <History size={20} />
            </Button>
            <UserMenu />
          </div>
        </div>
        <div className={styles.content}>
          <ThreadHistorySidebar
            open={isThreadHistoryOpen}
            setOpen={setIsThreadHistoryOpen}
            currentThreadId={threadId}
            onThreadSelect={handleThreadSelect}
          />
          <div className={styles.messagesContainer}>
            {!hasMessages && !isLoading && !isLoadingThreadState && (
              <div className={styles.emptyState}>
                <Bot size={48} className={styles.emptyIcon} />
                <h2>Start a conversation or select a thread from history</h2>
              </div>
            )}
            {isLoadingThreadState && (
              <div className={styles.threadLoadingState}>
                <LoaderCircle className={styles.threadLoadingSpinner} />
              </div>
            )}
            <div className={styles.messagesList}>
              {processedMessages.map((data) => (
                <ChatMessage
                  key={data.message.id}
                  message={data.message}
                  toolCalls={data.toolCalls}
                  showAvatar={data.showAvatar}
                  onSelectSubAgent={onSelectSubAgent}
                  selectedSubAgent={selectedSubAgent}
                />
              ))}
              {isLoading && (
                <div className={styles.loadingMessage}>
                  <LoaderCircle className={styles.spinner} />
                  <span>Working...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
        
        {/* AI SDK Enhanced Error Handling */}
        {useEnhancedAI && (
          <AIErrorBoundary
            error={error}
            onRetry={retry}
            onDismiss={() => {/* could add dismissal logic */}}
            canRetry={canRetry}
            retryCount={retryCount}
            maxRetries={3}
          />
        )}
        
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            style={{ display: 'none' }}
          />
          
          {/* Attachments area */}
          {(attachedFiles.length > 0 || attachedLinks.length > 0) && (
            <div className={styles.attachmentsArea}>
              {attachedFiles.map((file, index) => (
                <div key={index} className={styles.attachmentChip}>
                  <span className={styles.attachmentIcon}><FileText size={16} aria-label="File attachment" /></span>
                  <span className={styles.attachmentName}>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className={styles.removeButton}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {attachedLinks.map((link, index) => (
                <div key={index} className={styles.attachmentChip}>
                  <span className={styles.attachmentIcon}><Link size={16} aria-label="Link attachment" /></span>
                  <span className={styles.attachmentName}>{link}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(index)}
                    className={styles.removeButton}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Link input area */}
          {showLinkInput && (
            <div className={styles.linkInputArea}>
              <Input
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="Enter a link..."
                className={styles.linkInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLink();
                  }
                  if (e.key === 'Escape') {
                    setShowLinkInput(false);
                    setLinkInput("");
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddLink}
                disabled={!linkInput.trim()}
                size="sm"
                className={styles.addLinkButton}
              >
                Add
              </Button>
              <Button
                type="button"
                onClick={handleToggleLinkInput}
                variant="ghost"
                size="sm"
                className={styles.cancelLinkButton}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Main input area */}
          <div className={styles.mainInputArea}>
            <Button
              type="button"
              onClick={handleFileUpload}
              variant="ghost"
              size="icon"
              className={styles.attachButton}
              disabled={isLoading}
            >
              <Paperclip size={16} />
            </Button>
            <Button
              type="button"
              onClick={handleToggleLinkInput}
              variant="ghost"
              size="icon"
              className={styles.linkButton}
              disabled={isLoading}
            >
              <Link size={16} />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className={styles.input}
            />
            {isLoading ? (
              <Button
                type="button"
                onClick={stopStream}
                className={styles.stopButton}
              >
                Stop
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!input.trim()}
                className={styles.sendButton}
              >
                <Send size={16} />
              </Button>
            )}
          </div>
        </form>
        
        <AgentConfirmationDialog
          agent={selectedAgentForConfirmation}
          isOpen={isAgentDialogOpen}
          onConfirm={handleAgentConfirm}
          onCancel={handleAgentCancel}
        />
      </div>
    );
  },
);

ChatInterface.displayName = "ChatInterface";
