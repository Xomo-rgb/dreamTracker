// Firestore calls have no built-in timeout — under poor or zero connectivity,
// a call can sit pending indefinitely instead of rejecting, leaving a flow
// stuck with no feedback. Race a promise against this so it always resolves
// one way or another within a bounded time.
export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out waiting for: ${label}`)), ms)
    ),
  ]);
}
