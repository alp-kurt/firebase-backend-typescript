export type BusyMap = Record<string, boolean>;

export const withBusy = async (
  key: string,
  setBusy: (updater: (prev: BusyMap) => BusyMap) => void,
  fn: () => Promise<void>
): Promise<void> => {
  let alreadyBusy = false;
  setBusy((prev) => {
    alreadyBusy = !!prev[key];
    if (alreadyBusy) return prev;
    return { ...prev, [key]: true };
  });
  if (alreadyBusy) return;

  try {
    await fn();
  } finally {
    setBusy((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }
};
