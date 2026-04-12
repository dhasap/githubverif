"use client";

import { useEffect, useRef, useCallback } from "react";

// Simple notification sound using Web Audio API
// Creates a pleasant "ding" sound
export function playNotificationSound() {
  if (typeof window === "undefined") return;

  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // Create oscillator for the tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure sound - pleasant chime-like tone
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(1046.5, audioContext.currentTime + 0.1); // C6

    // Volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    // Clean up
    setTimeout(() => {
      audioContext.close().catch(() => {});
    }, 600);
  } catch {
    // Silent fail - audio is not critical
  }
}

// Success sound - ascending happy tone
export function playSuccessSound() {
  if (typeof window === "undefined") return;

  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (major chord arpeggio)
    const startTime = audioContext.currentTime;

    notes.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      const noteStart = startTime + index * 0.08;
      gainNode.gain.setValueAtTime(0, noteStart);
      gainNode.gain.linearRampToValueAtTime(0.2, noteStart + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.3);

      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.35);
    });

    setTimeout(() => {
      audioContext.close().catch(() => {});
    }, 600);
  } catch {
    // Silent fail
  }
}

// Error sound - descending tone
export function playErrorSound() {
  if (typeof window === "undefined") return;

  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);

    setTimeout(() => {
      audioContext.close().catch(() => {});
    }, 500);
  } catch {
    // Silent fail
  }
}

// Hook to manage sound settings
export function useSoundSettings() {
  const getSoundEnabled = useCallback(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("devpack-sound-enabled");
    return saved === "true";
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("devpack-sound-enabled", enabled.toString());
  }, []);

  const playNotification = useCallback(() => {
    if (getSoundEnabled()) {
      playNotificationSound();
    }
  }, [getSoundEnabled]);

  const playSuccess = useCallback(() => {
    if (getSoundEnabled()) {
      playSuccessSound();
    }
  }, [getSoundEnabled]);

  const playError = useCallback(() => {
    if (getSoundEnabled()) {
      playErrorSound();
    }
  }, [getSoundEnabled]);

  return {
    getSoundEnabled,
    setSoundEnabled,
    playNotification,
    playSuccess,
    playError,
  };
}
