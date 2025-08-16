
import React, { useMemo } from "react";
import { X, Bot, CheckCircle, AlertCircle, Clock, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownContent } from "../MarkdownContent/MarkdownContent";
import type { SubAgent } from "../../types/types";
import styles from "./SubAgentPanel.module.scss";

interface SubAgentPanelProps {
  subAgent: SubAgent;
  onClose: () => void;
}

const SubAgentPanelComponent = ({ subAgent, onClose }: SubAgentPanelProps) => {
  const statusIcon = useMemo(() => {
    switch (subAgent.status) {
      case "completed":
        return <CheckCircle className={styles.statusCompleted} />;
      case "error":
        return <AlertCircle className={styles.statusError} />;
      case "pending":
        return <Loader className={styles.statusActive} />;
      default:
        return <Clock className={styles.statusPending} />;
    }
  }, [subAgent.status]);

  const statusText = useMemo(() => {
    switch (subAgent.status) {
      case "completed":
        return "Completed";
      case "error":
        return "Error";
      case "active":
        return "Running";
      default:
        return "Pending";
    }
  }, [subAgent.status]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <Bot className={styles.agentIcon} />
          <div>
            <h3 className={styles.title}>{subAgent.subAgentName}</h3>
            <div className={styles.status}>
              {statusIcon}
              <span>{statusText}</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className={styles.closeButton}
        >
          <X size={20} />
        </Button>
      </div>

      <ScrollArea className={styles.messages}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Input</h4>
            <div className={styles.sectionContent}>
              <MarkdownContent
                content={
                  typeof subAgent.input === "string"
                    ? subAgent.input
                    : JSON.stringify(subAgent.input, null, 2)
                }
              />
            </div>
          </div>
          {subAgent.output && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Output</h4>
              <div className={styles.sectionContent}>
                <MarkdownContent
                  content={
                    typeof subAgent.output === "string"
                      ? subAgent.output
                      : JSON.stringify(subAgent.output, null, 2)
                  }
                />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export const SubAgentPanel = React.memo(
  SubAgentPanelComponent,
  (prevProps, nextProps) => {
    const inputEqual =
      JSON.stringify(prevProps.subAgent.input) ===
      JSON.stringify(nextProps.subAgent.input);
    const outputEqual =
      JSON.stringify(prevProps.subAgent.output) ===
      JSON.stringify(nextProps.subAgent.output);
    return (
      inputEqual &&
      outputEqual &&
      prevProps.subAgent.status === nextProps.subAgent.status &&
      prevProps.subAgent.id === nextProps.subAgent.id &&
      prevProps.onClose === nextProps.onClose
    );
  },
);

SubAgentPanel.displayName = "SubAgentPanel";
