import { Client } from "@langchain/langgraph-sdk";
import { getDeployment } from "./environment/deployments";
import { 
  AISDKError,
  InvalidArgumentError,
  LoadAPIKeyError 
} from "ai";

/**
 * Enhanced client creation with AI SDK error handling and validation
 */
export function createClient(accessToken: string) {
  const deployment = getDeployment();
  
  // Enhanced validation using AI SDK error types
  if (!deployment?.deploymentUrl) {
    throw new InvalidArgumentError({
      message: "Deployment URL is required but not configured",
      parameter: "deploymentUrl",
      value: deployment?.deploymentUrl
    });
  }

  if (!accessToken) {
    throw new LoadAPIKeyError({
      message: "Access token is required for authentication"
    });
  }

  try {
    return new Client({
      apiUrl: deployment.deploymentUrl,
      apiKey: accessToken,
      defaultHeaders: {
        "x-auth-scheme": "langsmith",
      },
    });
  } catch (error) {
    throw new AISDKError({
      name: "ClientCreationError",
      message: `Failed to create LangGraph client: ${error instanceof Error ? error.message : String(error)}`,
      cause: error instanceof Error ? error : undefined
    });
  }
}

/**
 * Enhanced deployment configuration with validation
 */
export function validateDeployment() {
  const deployment = getDeployment();
  
  const errors: string[] = [];
  
  if (!deployment?.deploymentUrl) {
    errors.push("VITE_DEPLOYMENT_URL is not configured");
  }
  
  if (!deployment?.agentId) {
    errors.push("VITE_AGENT_ID is not configured");
  }
  
  if (errors.length > 0) {
    throw new InvalidArgumentError({
      message: `Invalid deployment configuration: ${errors.join(", ")}`,
      parameter: "deployment",
      value: deployment
    });
  }
  
  return deployment;
}

// Re-export original function for backwards compatibility
export { createClient as createLangGraphClient };