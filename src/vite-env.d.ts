
/// <reference types="vite/client" />

// Add global type definitions for requestIdleCallback
interface Window {
  requestIdleCallback: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
  ) => number;
  cancelIdleCallback: (handle: number) => void;
}

interface IdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
}

type IdleRequestCallback = (deadline: IdleDeadline) => void;

interface IdleRequestOptions {
  timeout?: number;
}
