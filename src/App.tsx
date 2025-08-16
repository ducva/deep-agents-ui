import { useState, useCallback, useEffect } from "react";
import { useQueryState } from "nuqs";
import { AuthProvider } from "@/providers/Auth";
import { NuqsAdapter } from "nuqs/adapters/react";
import { Toaster } from "sonner";
import { ChatInterface } from "@/app/components/ChatInterface/ChatInterface";
import { TasksFilesSidebar } from "@/app/components/TasksFilesSidebar/TasksFilesSidebar";
import { SubAgentPanel } from "@/app/components/SubAgentPanel/SubAgentPanel";
import { FileViewDialog } from "@/app/components/FileViewDialog/FileViewDialog";
import { createClient } from "@/lib/client";
import { useAuthContext } from "@/providers/Auth";
import type { SubAgent, FileItem, TodoItem } from "@/app/types/types";
import styles from "@/app/page.module.scss";

function HomePage() {
  const { session } = useAuthContext();
  const [threadId, setThreadId] = useQueryState("threadId");
  const [selectedSubAgent, setSelectedSubAgent] = useState<SubAgent | null>(
    null,
  );
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoadingThreadState, setIsLoadingThreadState] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  // When the threadId changes, grab the thread state from the graph server
  useEffect(() => {
    const fetchThreadState = async () => {
      if (!threadId || !session?.accessToken) {
        setTodos([]);
        setFiles({});
        setIsLoadingThreadState(false);
        return;
      }

      setIsLoadingThreadState(true);
      try {
        const client = createClient(session.accessToken);
        const threadState = await client.threads.getState(threadId);

        if (threadState?.values) {
          const { todos: threadTodos = [], files: threadFiles = {} } =
            threadState.values as any;
          setTodos(threadTodos);
          setFiles(threadFiles);
        }
      } catch (error) {
        console.error("Failed to fetch thread state:", error);
      } finally {
        setIsLoadingThreadState(false);
      }
    };

    fetchThreadState();
  }, [threadId, session?.accessToken]);

  const handleNewThread = useCallback(() => {
    setThreadId(null);
    setSelectedSubAgent(null);
    setSelectedFile(null);
    setTodos([]);
    setFiles({});
  }, [setThreadId]);

  if (!session) {
    return null; // AuthProvider should handle redirecting
  }

  return (
    <div className={styles.container}>
      <TasksFilesSidebar
        todos={todos}
        files={files}
        onFileClick={setSelectedFile}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      <div className={styles.mainContent}>
        <ChatInterface
          threadId={threadId}
          selectedSubAgent={selectedSubAgent}
          setThreadId={setThreadId}
          onSelectSubAgent={setSelectedSubAgent}
          onTodosUpdate={setTodos}
          onFilesUpdate={setFiles}
          onNewThread={handleNewThread}
          isLoadingThreadState={isLoadingThreadState}
        />
        {selectedSubAgent && (
          <SubAgentPanel
            subAgent={selectedSubAgent}
            onClose={() => setSelectedSubAgent(null)}
          />
        )}
      </div>
      {selectedFile && (
        <FileViewDialog
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <NuqsAdapter>
        <HomePage />
        <Toaster position="top-right" />
      </NuqsAdapter>
    </AuthProvider>
  );
}

export default App;