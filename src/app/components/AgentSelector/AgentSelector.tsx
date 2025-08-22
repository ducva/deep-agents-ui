import React, { useState, useEffect } from "react";
import { Users, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAvailableAgents, getCurrentAgent, fetchAgentsFromAPI } from "@/lib/agents";
import { useAuthContext } from "@/providers/Auth";
import type { Agent } from "@/app/types/types";

interface AgentSelectorProps {
  onAgentSelect: (agent: Agent) => void;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({ onAgentSelect }) => {
  const { session } = useAuthContext();
  const [availableAgents, setAvailableAgents] = useState<Agent[]>(() => getAvailableAgents());
  const [isLoading, setIsLoading] = useState(false);
  const currentAgent = getCurrentAgent();

  useEffect(() => {
    const loadAgents = async () => {
      if (!session?.accessToken) {
        // Use fallback agents if no session
        setAvailableAgents(getAvailableAgents());
        return;
      }

      setIsLoading(true);
      try {
        const apiAgents = await fetchAgentsFromAPI(session.accessToken);
        setAvailableAgents(apiAgents);
      } catch (error) {
        console.error("Failed to load agents, using fallback:", error);
        setAvailableAgents(getAvailableAgents());
      } finally {
        setIsLoading(false);
      }
    };

    loadAgents();
  }, [session?.accessToken]);

  const handleAgentChange = (agentId: string) => {
    const agent = availableAgents.find(a => a.id === agentId);
    if (agent && agent.id !== currentAgent.id) {
      onAgentSelect(agent);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={handleAgentChange} defaultValue={currentAgent.id}>
        <SelectTrigger className="w-[180px] h-10">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Users className="h-4 w-4" />
            )}
            <SelectValue>
              <span className="truncate">{currentAgent.name}</span>
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {availableAgents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              <div className="flex flex-col gap-1 py-1">
                <span className="font-medium">{agent.name}</span>
                <span className="text-xs text-muted-foreground line-clamp-2">
                  {agent.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};