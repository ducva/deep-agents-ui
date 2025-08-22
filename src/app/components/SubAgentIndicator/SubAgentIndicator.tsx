
import React from "react";
import { CheckCircle, AlertCircle, Clock, Loader } from "lucide-react";
import type { SubAgent } from "../../types/types";

interface SubAgentIndicatorProps {
  subAgent: SubAgent;
  onClick: () => void;
}

export const SubAgentIndicator = React.memo<SubAgentIndicatorProps>(
  ({ subAgent, onClick }) => {
    const getStatusIcon = () => {
      switch (subAgent.status) {
        case "completed":
          return <CheckCircle className="text-success w-3.5 h-3.5 flex-shrink-0" />;
        case "error":
          return <AlertCircle className="text-error w-3.5 h-3.5 flex-shrink-0" />;
        case "pending":
          return <Loader className="text-primary w-3.5 h-3.5 flex-shrink-0 animate-spin" />;
        default:
          return <Clock className="text-text-tertiary w-3.5 h-3.5 flex-shrink-0" />;
      }
    };

    return (
      <button
        onClick={onClick}
        className="flex items-start gap-4 w-full p-4 px-6 bg-avatar-bg border border-border rounded-md text-left transition-all duration-base cursor-pointer hover:bg-subagent-hover hover:translate-x-0.5 hover:shadow-[0_2px_8px_var(--color-border)] active:translate-x-0"
        aria-label={`View ${subAgent.name} details`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-start gap-2">
            {getStatusIcon()}
            <span className="text-lg font-semibold text-text-primary">{subAgent.subAgentName}</span>
          </div>
          <p className="text-xs text-text-secondary leading-normal m-0 overflow-hidden text-ellipsis line-clamp-2">{subAgent.input}</p>
        </div>
      </button>
    );
  },
);

SubAgentIndicator.displayName = "SubAgentIndicator";
