import { getPasswordStrength } from "@/lib/crypto";

export default function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, color, tip } = getPasswordStrength(password);
  const segments = Math.min(4, Math.ceil((score / 7) * 4));

  const colorMap: Record<string, string> = {
    destructive: "bg-destructive",
    warning: "bg-warning",
    success: "bg-success",
  };
  const textMap: Record<string, string> = {
    destructive: "text-destructive",
    warning: "text-warning",
    success: "text-success",
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < segments ? colorMap[color] : "bg-border"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${textMap[color]}`}>{label}</span>
        <span className="text-xs text-muted-foreground">{tip}</span>
      </div>
    </div>
  );
}
