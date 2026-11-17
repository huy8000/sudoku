export function formatDuration(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const secondRest = totalSeconds % 60;

  if (typeof Intl !== "undefined" && "DurationFormat" in Intl) {
    try {
      const formatted = new (Intl as any).DurationFormat("en-US", {
        style: "digital",
        minutesDisplay: "always",
        secondsDisplay: "always",
      }).format({minutes, seconds: secondRest});
      return `${formatted} min`;
    } catch {
      // fallback to manual formatting
    }
  }

  const minuteString = String(minutes).padStart(2, "0");
  const secondString = String(secondRest).padStart(2, "0");

  return `${minuteString}:${secondString} min`;
}
