import type { Agent } from "@/app/types/types";

// Mock agent configurations for demonstration
// In a real application, these would likely come from an API or configuration service
export const AVAILABLE_AGENTS: Agent[] = [
  {
    id: "deepagent",
    name: "Deep Agent",
    description: "General purpose AI agent capable of handling tasks of varying complexity",
    deploymentUrl: import.meta.env.VITE_DEPLOYMENT_URL || "http://127.0.0.1:2024"
  },
  {
    id: "research-agent",
    name: "Research Agent",
    description: "Specialized agent for research and information gathering tasks",
    deploymentUrl: import.meta.env.VITE_DEPLOYMENT_URL || "http://127.0.0.1:2024"
  },
  {
    id: "coding-agent",
    name: "Coding Agent", 
    description: "Expert agent focused on software development and coding tasks",
    deploymentUrl: import.meta.env.VITE_DEPLOYMENT_URL || "http://127.0.0.1:2024"
  },
  {
    id: "analysis-agent",
    name: "Analysis Agent",
    description: "Data analysis and insights specialist agent",
    deploymentUrl: import.meta.env.VITE_DEPLOYMENT_URL || "http://127.0.0.1:2024"
  }
];

export function getAvailableAgents(): Agent[] {
  return AVAILABLE_AGENTS;
}

export function getAgentById(id: string): Agent | null {
  return AVAILABLE_AGENTS.find(agent => agent.id === id) || null;
}

export function getCurrentAgent(): Agent {
  // Check URL parameters first
  const urlParams = new URLSearchParams(window.location.search);
  // Check URL parameters first (only on client-side)
  let agentFromUrl: string | null = null;
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    agentFromUrl = urlParams.get('agent');
  }
  
  if (agentFromUrl) {
    const agent = getAgentById(agentFromUrl);
    if (agent) return agent;
  }
  
  // Fallback to environment variable
  const currentId = import.meta.env.VITE_AGENT_ID || "deepagent";
  return getAgentById(currentId) || AVAILABLE_AGENTS[0];
}