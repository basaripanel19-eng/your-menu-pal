import { useEffect, useRef, useState } from "react";
import { playGo, playTick, unlockAudio } from "./sounds";

const STEPS = ["3", "2", "1", "BAŞLA!"];

/** Yarışma başladığında (PLAYING'e geçiş, 1. soru) 3-2-1-BAŞLA! geri sayımı gösterir ve ses çalar.
 *  Öğretmen ve oyuncu ekranları aynı durum değişikliğini aynı anda gördüğü için birlikte çalar.
 *  Geri sayım sırasında öğrenci ekranı tam ekran olur: katılırken istenmişse zaten tam ekrandır,
 *  değilse overlay üzerinde tek dokunuşla tam ekran açılır. */
export function useStartCountdown(status: string | undefined, qIndex: number | undefined) {
  const prev = useRef<string | undefined>(undefined);
  const [step, setStep] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== "undefined" && !!document.fullscreenElement,
  );

  useEffect(() => {
    unlockAudio();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const before = prev.current;
    prev.current = status;
    if (
      status === "PLAYING" &&
      (qIndex ?? 1) === 1 &&
      (before === "WAITING" || before === "READY" || before === "FINISHED")
    ) {
      setStep(0);
    }
  }, [status, qIndex]);

  useEffect(() => {
    if (step === null) return;
    if (step === STEPS.length - 1) playGo();
    else playTick();
    const id = setTimeout(() => setStep(step + 1 < STEPS.length ? step + 1 : null), step === STEPS.length - 1 ? 900 : 1000);
    return () => clearTimeout(id);
  }, [step]);

  if (step === null) return null;
  const isGo = step === STEPS.length - 1;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm">
      {isFullscreen ? (
        <button
          onClick={() => {
            setStep(null);
            void document.exitFullscreen().catch(() => {});
          }}
          className="absolute right-4 top-4 z-10 rounded-lg border-2 border-border bg-panel px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
        >
          TAM EKRANDAN ÇIK
        </button>
      ) : (
        <button
          onClick={() => {
            void document.documentElement.requestFullscreen().catch(() => {});
          }}
          className="absolute right-4 top-4 z-10 rounded-lg border-2 border-primary bg-panel px-4 py-2 text-xs font-bold text-primary hover:bg-muted"
        >
          TAM EKRAN YAP
        </button>
      )}
      <span
        key={step}
        className={`countdown-pop font-extrabold ${isGo ? "text-7xl text-primary sm:text-9xl" : "text-[10rem] text-foreground sm:text-[16rem]"}`}
      >
        {STEPS[step]}
      </span>
    </div>
  );
}
