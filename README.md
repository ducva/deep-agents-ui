# Deep Agents UI

Deep Agents are generic AI agents that are capable of handling tasks of varying complexity. This is a UI intended to be used alongside the [`deep-agents`](https://github.com/hwchase17/deepagents?ref=blog.langchain.com) package from LangChain.

If the term "Deep Agents" is new to you, check out these videos!
[What are Deep Agents?](https://www.youtube.com/watch?v=433SmtTc0TA)
[Implementing Deep Agents](https://www.youtube.com/watch?v=TTMYJAw5tiA&t=701s)


And check out this [video](https://youtu.be/0CE_BhdnZZI) for a walkthrough of this UI.

### Connecting to a Local LangGraph Server

Create a `.env.local` file and set two variables

```env
VITE_DEPLOYMENT_URL="http://127.0.0.1:2024" # Or your server URL
VITE_AGENT_ID=<your agent ID from langgraph.json>
```

### Connecting to a Production LangGraph Deployment on LGP

Create a `.env.local` file and set three variables

```env
VITE_DEPLOYMENT_URL="your agent server URL"
VITE_AGENT_ID=<your agent ID from langgraph.json>
VITE_LANGSMITH_API_KEY=<langsmith-api-key>
```

## Deployment

### Local Development

Once you have your environment variables set, install all dependencies and run your app.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to test out your deep agent!

### AWS Amplify Deployment

This application is configured to deploy on AWS Amplify with the included `amplify.yml` configuration file.

#### Steps to deploy on AWS Amplify:

1. **Connect your repository**: In the AWS Amplify console, connect your GitHub repository.

2. **Set environment variables**: In the Amplify console, go to Environment variables and add:
   - `VITE_DEPLOYMENT_URL`: Your agent server URL
   - `VITE_AGENT_ID`: Your agent ID from langgraph.json
   - `VITE_LANGSMITH_API_KEY`: Your LangSmith API key

3. **Deploy**: Amplify will automatically detect the `amplify.yml` file and use it for the build configuration.

The build configuration is set to:
- Install dependencies with `npm ci`
- Build the application with `npm run build`
- Serve files from the `dist/` directory
