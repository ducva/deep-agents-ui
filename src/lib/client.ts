import { Client } from "@langchain/langgraph-sdk";
import { getDeployment } from "./environment/deployments";

// Re-export enhanced AI SDK utilities
export { createClient as createEnhancedClient, validateDeployment } from "./aiClient";

// Original implementation for backwards compatibility
export function createClient(accessToken: string) {
  const deployment = getDeployment();
  return new Client({
    apiUrl: deployment?.deploymentUrl || "",
    apiKey: accessToken,
    defaultHeaders: {
      "x-auth-scheme": "langsmith",
    },
  });
}
