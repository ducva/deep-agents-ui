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

function LoginPage() {
  const { login, error, authProvider } = useAuthContext();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Deep Agents UI</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in to continue
          </p>
          {import.meta.env.DEV && (
            <p className="mt-1 text-xs text-blue-600">
              {authProvider === 'auth0' ? 'Auth0 Configuration Active' : 'Development Mode'}
            </p>
          )}
        </div>
        
        <div className="space-y-4">
          <button
            onClick={login}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {authProvider === 'auth0' ? 'Sign in with Auth0' : 'Sign in (Development)'}
          </button>
          
          {error && (
            <div className="text-sm text-red-600 text-center">
              <p className="font-medium">Authentication Error</p>
              <p className="mt-1">{error.message}</p>
              {import.meta.env.DEV && (
                <p className="mt-2 text-xs text-gray-500">
                  Check your Auth0 configuration or disable VITE_FORCE_AUTH0_LOGIN for development mode
                </p>
              )}
            </div>
          )}

          {import.meta.env.DEV && authProvider === 'auth0' && (
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>Development mode: Auth0 configured with domain:</p>
              <p className="font-mono bg-gray-100 px-2 py-1 rounded">
                {import.meta.env.VITE_AUTH0_DOMAIN}
              </p>
              <p>Set <span className="font-mono">VITE_FORCE_AUTH0_LOGIN=false</span> to use development fallback</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function HomePage() {
  const { session, isLoading, error } = useAuthContext();
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

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600">Authentication Error</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
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