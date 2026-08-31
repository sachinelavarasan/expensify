import React, { useCallback, useRef, useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  // Omit for a single dismiss-button heads-up (Alert.alert(title, message)
  // equivalent); provide it to get a Cancel/Confirm pair.
  cancelText?: string;
  destructive?: boolean;
}

// Promise-based drop-in for the
// `await new Promise((resolve) => Alert.alert(title, message, [...]))` pattern
// used everywhere in this app - swap that block for
// `await confirm({ title, message, confirmText, cancelText, destructive })`
// and render `{confirmModal}` once alongside the screen's other modals.
export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setOptions(opts);
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    setOptions(null);
    resolverRef.current?.(value);
    resolverRef.current = null;
  }, []);

  const confirmModal = (
    <ConfirmModal
      visible={!!options}
      title={options?.title ?? ''}
      message={options?.message}
      confirmText={options?.confirmText}
      cancelText={options?.cancelText}
      destructive={options?.destructive}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  );

  return { confirm, confirmModal };
}
