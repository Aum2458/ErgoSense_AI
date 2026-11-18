import { SupportedLanguage } from '../types/ergosense.ts';

export class VoiceAssistant {
  private static synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  private static isSpeaking = false;

  // Language mapping
  private static langMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    gu: 'gu-IN',
  };

  /**
   * Speak guidance or coaching response in English, Hindi, or Gujarati
   */
  public static speak(text: string, lang: SupportedLanguage = 'en', onEnd?: () => void) {
    if (!this.synth) {
      onEnd?.();
      return;
    }

    try {
      this.synth.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.langMap[lang] || 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select matching voice if available
      const voices = this.synth.getVoices();
      const targetLang = this.langMap[lang];
      const matchedVoice = voices.find((v) => v.lang.startsWith(targetLang) || v.lang.includes(lang));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        onEnd?.();
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
        onEnd?.();
      };

      this.isSpeaking = true;
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      onEnd?.();
    }
  }

  public static stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Play a clean, subtle Web Audio API chime for smart reminder nudges (no audio files needed)
   */
  public static playChime(type: 'subtle_nudge' | 'micro_break' | 'success' = 'subtle_nudge') {
    if (typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'subtle_nudge') {
        // Soft dual-tone bell (E5 -> A5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

        osc.start(now);
        osc.stop(now + 0.65);
      } else if (type === 'micro_break') {
        // Calming 3-tone chime (C5 -> E5 -> G5)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.15);
        osc.frequency.setValueAtTime(783.99, now + 0.3);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.start(now);
        osc.stop(now + 1.25);
      } else {
        // Success chord
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.14, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

        osc.start(now);
        osc.stop(now + 0.55);
      }
    } catch (e) {
      // Audio context might be restricted before user interaction
    }
  }
}
