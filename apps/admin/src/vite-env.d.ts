/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_ENV: "development" | "test" | "staging" | "production";
  readonly VITE_APP_VERSION: string;
  readonly VITE_API_URL: string;
  readonly VITE_ENABLE_API_MOCKS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
