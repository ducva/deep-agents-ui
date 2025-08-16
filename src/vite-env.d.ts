/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LANGSMITH_API_KEY: string
  readonly VITE_DEPLOYMENT_URL: string
  readonly VITE_AGENT_ID: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}