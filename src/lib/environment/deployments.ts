export function getDeployment() {
  return {
    name: "Deep Agent",
    deploymentUrl: import.meta.env.VITE_DEPLOYMENT_URL || "http://127.0.0.1:2024",
    agentId: import.meta.env.VITE_AGENT_ID || "deepagent",
  };
}
