import type { Agent } from "@/app/types/types";
import { getDeployment } from "@/lib/environment/deployments";

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
  },
  {
    id: "builtin-agent-virtual-persona-generator",
    name: "Virtual Persona Generator",
    description: "Custom agent for virtual persona generator",
    deploymentUrl: import.meta.env.VITE_DEPLOYMENT_URL || "http://127.0.0.1:2024",
    parameters: {
      customer_segments_file: {
        type: "file",
        label: "Customer Segments File",
        renderType: "file",
        mimeType: "application/json",
        isMultipleFiles: false
      },
      persona_focus: {
        type: "string",
        enum: ["comprehensive", "targeted"],
        renderType: "select",
        default: "comprehensive"
      },
      research_depth: {
        type: "string",
        enum: ["comprehensive", "targeted"],
        renderType: "select",
        default: "comprehensive"
      },
      output_format: {
        type: "string",
        enum: ["json", "xml"],
        renderType: "select",
        default: "json"
      },
      enable_web_search: {
        type: "boolean",
        renderType: "switch",
        default: true
      },
      max_personas: {
        type: "integer",
        renderType: "input",
        default: 7
      }
    }
  }
];

export function getAvailableAgents(): Agent[] {
  return AVAILABLE_AGENTS;
}

/**
 * Fetch agents from the API endpoint
 * GET /v20250505/{workspace_id}/agents
 */
export async function fetchAgentsFromAPI(accessToken: string): Promise<Agent[]> {
  try {
    const deployment = getDeployment();
    if (!deployment.deploymentUrl || !deployment.workspaceId) {
      console.warn("Missing deployment configuration, falling back to hardcoded agents");
      return AVAILABLE_AGENTS;
    }

    const apiUrl = `${deployment.deploymentUrl}/v20250505/${deployment.workspaceId}/agents?type=built-in`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-auth-scheme': 'langsmith',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const agents = data["data"]
    
    // Map the API response to our Agent interface
    // We'll need to adjust this based on the actual API response structure
    if (Array.isArray(agents)) {
      return agents.map((agent: any) => ({
        id: agent._id || agent.agent_id || agent.name || "",
        name: agent.name || agent.display_name || agent.id || "",
        description: agent.description || agent.summary || "",
        deploymentUrl: deployment.deploymentUrl,
        parameters: agent.parameters || undefined,
      }));
    }
    
    return AVAILABLE_AGENTS;
  } catch (error) {
    console.error("Failed to fetch agents from API:", error);
    // Fallback to hardcoded agents on error
    return AVAILABLE_AGENTS;
  }
}

export function getAgentById(id: string): Agent | null {
  return AVAILABLE_AGENTS.find(agent => agent.id === id) || null;
}

export function getCurrentAgent(): Agent {
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

export function getCurrentAgentParameters(): Record<string, any> | null {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const paramsString = urlParams.get('agentParams');
    
    // Try URL parameters first
    if (paramsString) {
      try {
        return JSON.parse(paramsString);
      } catch (error) {
        console.error('Failed to parse agent parameters from URL:', error);
      }
    }
    
    // Fallback to localStorage
    const currentAgent = getCurrentAgent();
    if (currentAgent?.id) {
      const storageKey = `agent_params_${currentAgent.id}`;
      const storedParams = localStorage.getItem(storageKey);
      if (storedParams) {
        try {
          return JSON.parse(storedParams);
        } catch (error) {
          console.error('Failed to parse agent parameters from localStorage:', error);
        }
      }
    }
  }
  return null;
}