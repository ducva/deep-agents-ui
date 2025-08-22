import React, { useState, useMemo } from "react";
import { Bot, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentAgent, getCurrentAgentParameters } from "@/lib/agents";
import type { Agent } from "@/app/types/types";
import styles from "./AgentIndicator.module.scss";

interface AgentIndicatorProps {
  onAgentSelect?: (agent: Agent) => void;
}

export const AgentIndicator: React.FC<AgentIndicatorProps> = ({ onAgentSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const currentAgent = useMemo(() => getCurrentAgent(), []);
  const currentParameters = useMemo(() => getCurrentAgentParameters(), []);
  
  const hasParameters = currentParameters && Object.keys(currentParameters).length > 0;

  const handleToggle = () => {
    setIsExpanded(prev => !prev);
  };

  const handleAgentClick = () => {
    if (onAgentSelect) {
      onAgentSelect(currentAgent);
    }
  };

  const renderParameterValue = (value: any): string => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div className={styles.container}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className={styles.trigger}
      >
        <Bot className={styles.icon} />
        <span className={styles.agentName}>{currentAgent.name}</span>
        {hasParameters && (
          isExpanded ? <ChevronUp className={styles.chevron} /> : <ChevronDown className={styles.chevron} />
        )}
      </Button>
      
      {isExpanded && hasParameters && (
        <div className={styles.details}>
          <div className={styles.header}>
            <span className={styles.title}>Current Configuration</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAgentClick}
              className={styles.changeButton}
            >
              Change
            </Button>
          </div>
          <div className={styles.parameters}>
            {Object.entries(currentParameters).map(([key, value]) => (
              <div key={key} className={styles.parameter}>
                <span className={styles.parameterKey}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                </span>
                <span className={styles.parameterValue}>
                  {renderParameterValue(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};