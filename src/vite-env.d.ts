/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

declare module 'virtual:pwa-register/react' {
  import type { Ref } from 'react'
  export interface RegisterSWOptions {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: unknown) => void
  }
  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: [Ref<boolean>, (v: boolean) => void]
    offlineReady: [Ref<boolean>, (v: boolean) => void]
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>
  }
}
