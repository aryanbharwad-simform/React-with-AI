/// <reference types="vite/client" />

// Typed environment variables (otherwise they'd be loosely typed).
interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
