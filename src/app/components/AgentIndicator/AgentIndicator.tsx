import React, { useState, useMemo } from "react";
import { Bot, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentAgent, getCurrentAgentParameters } from "@/lib/agents";
import type { Agent } from "@/app/types/types";

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
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="flex items-center gap-2 py-2 px-3 rounded-md bg-blue-500/10 border border-blue-500/20 transition-all duration-200 hover:bg-blue-500/15 hover:border-blue-500/30"
      >
        <Bot className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-medium text-blue-500">{currentAgent.name}</span>
        {hasParameters && (
          isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-blue-500" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
        )}
      </Button>
      
      {isExpanded && hasParameters && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Current Configuration</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAgentClick}
              className="text-xs px-2 py-1 h-auto hover:bg-gray-100"
            >
              Change
            </Button>
          </div>
          <div className="space-y-2">
            {Object.entries(currentParameters).map(([key, value]) => (
              <div key={key} className="flex justify-between items-start gap-2">
                <span className="text-xs text-gray-600 font-medium min-w-0 flex-shrink-0 capitalize">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                </span>
                <span className="text-xs text-gray-800 text-right break-all">
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