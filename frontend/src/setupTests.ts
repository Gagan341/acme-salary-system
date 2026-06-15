import "@testing-library/jest-dom";

// jsdom has no ResizeObserver; Recharts' ResponsiveContainer needs it.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as typeof globalThis & { ResizeObserver: unknown }).ResizeObserver =
  ResizeObserverStub;
