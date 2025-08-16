import { useCallback, useMemo } from "react";
import { useStream } from "@langchain/langgraph-sdk/react";
import { type Message } from "@langchain/langgraph-sdk";
import { getDeployment } from "@/lib/environment/deployments";
import { v4 as uuidv4 } from "uuid";
import type { TodoItem } from "../types/types";
import { createClient } from "@/lib/client";
import { useAuthContext } from "@/providers/Auth";

// Re-export the enhanced AI SDK version
export { useAIChat } from "./useAIChat";

type StateType = {
  messages: Message[];
  todos: TodoItem[];
  files: Record<string, string>;
};

export function useChat(
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

  const agentId = useMemo(() => {
    if (!deployment?.agentId) {
      throw new Error(`No agent ID configured in environment`);
    }
    return deployment.agentId;
  }, [deployment]);

  const handleUpdateEvent = useCallback(
    (data: { [node: string]: Partial<StateType> }) => {
      Object.entries(data).forEach(([_, nodeData]) => {
        if (nodeData?.todos) {
          onTodosUpdate(nodeData.todos);
        }
        if (nodeData?.files) {
          onFilesUpdate(nodeData.files);
        }
      });
    },
    [onTodosUpdate, onFilesUpdate],
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

  const sendMessage = useCallback(
    (message: string) => {
      const humanMessage: Message = {
        id: uuidv4(),
        type: "human",
        content: message,
      };
      stream.submit(
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
    },
    [stream],
  );

  const stopStream = useCallback(() => {
    stream.stop();
  }, [stream]);

  return {
    messages: stream.messages,
    isLoading: stream.isLoading,
    sendMessage,
    stopStream,
  };
}
