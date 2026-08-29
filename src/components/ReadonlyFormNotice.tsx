import { Construction } from "lucide-react";

export function ReadonlyFormNotice() {
  return (
    <div className="flex gap-3 rounded-2xl border border-glass-border bg-white/[0.025] p-4">
      <Construction className="mt-0.5 size-4 shrink-0 text-accent" />
      <p className="text-xs leading-relaxed text-muted-foreground">Frontend form sudah mengikuti requirement. Submit, sesi, email verification, dan penyimpanan database baru diaktifkan pada fase backend.</p>
    </div>
  );
}
