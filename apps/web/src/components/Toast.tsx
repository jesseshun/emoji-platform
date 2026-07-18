'use client';

// Thin compatibility shim. The real implementation (with the globally mounted
// <ToastContainer /> in app/layout.tsx) lives in @/components/ui/Toast.
// Delegating here keeps legacy `import { showToast } from './Toast'` call sites
// (e.g. CopyButton, CopyArea, CopyValueButton) working without duplication.
export { showToast, ToastContainer } from '@/components/ui/Toast';
