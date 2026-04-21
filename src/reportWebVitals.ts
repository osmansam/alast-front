type ReportHandler = (metric: unknown) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (!onPerfEntry || !(onPerfEntry instanceof Function)) {
    return;
  }

  // web-vitals API varies by major version; keep this no-op-safe wrapper.
  import("web-vitals").then((mod) => {
    const fns = [
      (mod as Record<string, unknown>).onCLS,
      (mod as Record<string, unknown>).onINP,
      (mod as Record<string, unknown>).onLCP,
      (mod as Record<string, unknown>).onFCP,
      (mod as Record<string, unknown>).onTTFB,
    ].filter(
      (fn): fn is (cb: ReportHandler) => void => typeof fn === "function",
    );

    fns.forEach((fn) => fn(onPerfEntry));
  });
};

export default reportWebVitals;
