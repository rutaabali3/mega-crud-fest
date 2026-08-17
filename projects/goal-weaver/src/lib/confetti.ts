import confetti from "canvas-confetti";

export function fireConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#3b82f6", "#22c55e", "#06b6d4"],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#3b82f6", "#22c55e", "#06b6d4"],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
