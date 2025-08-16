
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import { createClient } from "@/lib/client";
import { useAuthContext } from "@/providers/Auth";
import { getDeployment } from "@/lib/environment/deployments";
import type { Thread } from "../../types/types";
import styles from "./ThreadHistorySidebar.module.scss";
import { extractStringFromMessageContent } from "../../utils/utils";

interface ThreadHistorySidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  currentThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
}

export const ThreadHistorySidebar = React.memo<ThreadHistorySidebarProps>(
  ({ open, setOpen, currentThreadId, onThreadSelect }) => {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [isLoadingThreadHistory, setIsLoadingThreadHistory] = useState(true);
    const { session } = useAuthContext();
    const deployment = useMemo(() => getDeployment(), []);

    const fetchThreads = useCallback(async () => {
      if (!deployment?.deploymentUrl || !session?.accessToken) return;
      setIsLoadingThreadHistory(true);
      try {
        const client = createClient(session.accessToken);
        const response = await client.threads.search({
          limit: 30,
          sortBy: "created_at",
          sortOrder: "desc",
        });
        const threadList: Thread[] = response.map((thread: any) => {
          let displayContent = `Thread ${thread.thread_id.slice(0, 8)}`;
          try {
            if (
              thread.values &&
              typeof thread.values === "object" &&
              "messages" in thread.values
            ) {
              const messages = (thread.values as any).messages;
              if (Array.isArray(messages) && messages.length > 0) {
                displayContent = extractStringFromMessageContent(messages[0]);
              }
            }
          } catch (error) {
            console.warn(
              `Failed to get first message for thread ${thread.thread_id}:`,
              error,
            );
          }
          return {
            id: thread.thread_id,
            title: displayContent,
            createdAt: new Date(thread.created_at),
            updatedAt: new Date(thread.updated_at || thread.created_at),
          } as Thread;
        });
        setThreads(
          threadList.sort(
            (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
          ),
        );
      } catch (error) {
        console.error("Failed to fetch threads:", error);
      } finally {
        setIsLoadingThreadHistory(false);
      }
    }, [deployment?.deploymentUrl, session?.accessToken]);

    useEffect(() => {
      fetchThreads();
    }, [fetchThreads, currentThreadId]);

    const groupedThreads = useMemo(() => {
      const groups: Record<string, Thread[]> = {
        today: [],
        yesterday: [],
        week: [],
        older: [],
      };
      const now = new Date();
      threads.forEach((thread) => {
        const diff = now.getTime() - thread.updatedAt.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) groups.today.push(thread);
        else if (days === 1) groups.yesterday.push(thread);
        else if (days < 7) groups.week.push(thread);
        else groups.older.push(thread);
      });
      return groups;
    }, [threads]);

    if (!open) return null;

    return (
      <div className={styles.overlay}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h3 className={styles.title}>Thread History</h3>
            <div className={styles.headerActions}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className={styles.closeButton}
              >
                <X size={20} />
              </Button>
            </div>
          </div>
          <ScrollArea className={styles.scrollArea}>
            {isLoadingThreadHistory ? (
              <div className={styles.loading}>Loading threads...</div>
            ) : threads.length === 0 ? (
              <div className={styles.empty}>
                <MessageSquare className={styles.emptyIcon} />
                <p>No threads yet</p>
              </div>
            ) : (
              <div className={styles.threadList}>
                {groupedThreads.today.length > 0 && (
                  <div className={styles.group}>
                    <h4 className={styles.groupTitle}>Today</h4>
                    {groupedThreads.today.map((thread) => (
                      <ThreadItem
                        key={thread.id}
                        thread={thread}
                        isActive={thread.id === currentThreadId}
                        onClick={() => onThreadSelect(thread.id)}
                      />
                    ))}
                  </div>
                )}
                {groupedThreads.yesterday.length > 0 && (
                  <div className={styles.group}>
                    <h4 className={styles.groupTitle}>Yesterday</h4>
                    {groupedThreads.yesterday.map((thread) => (
                      <ThreadItem
                        key={thread.id}
                        thread={thread}
                        isActive={thread.id === currentThreadId}
                        onClick={() => onThreadSelect(thread.id)}
                      />
                    ))}
                  </div>
                )}
                {groupedThreads.week.length > 0 && (
                  <div className={styles.group}>
                    <h4 className={styles.groupTitle}>This Week</h4>
                    {groupedThreads.week.map((thread) => (
                      <ThreadItem
                        key={thread.id}
                        thread={thread}
                        isActive={thread.id === currentThreadId}
                        onClick={() => onThreadSelect(thread.id)}
                      />
                    ))}
                  </div>
                )}
                {groupedThreads.older.length > 0 && (
                  <div className={styles.group}>
                    <h4 className={styles.groupTitle}>Older</h4>
                    {groupedThreads.older.map((thread) => (
                      <ThreadItem
                        key={thread.id}
                        thread={thread}
                        isActive={thread.id === currentThreadId}
                        onClick={() => onThreadSelect(thread.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    );
  },
);

const ThreadItem = React.memo<{
  thread: Thread;
  isActive: boolean;
  onClick: () => void;
}>(({ thread, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.threadItem} ${isActive ? styles.active : ""}`}
    >
      <MessageSquare className={styles.threadIcon} />
      <div className={styles.threadContent}>
        <div className={styles.threadTitle}>{thread.title}</div>
      </div>
    </button>
  );
});

ThreadItem.displayName = "ThreadItem";
ThreadHistorySidebar.displayName = "ThreadHistorySidebar";
