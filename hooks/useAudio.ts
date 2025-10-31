
import { useRef, useEffect } from 'react';

export const useAudio = (src: string, loop: boolean = false) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (src) {
      audioRef.current = new Audio(src);
      audioRef.current.loop = loop;
    } else {
      audioRef.current = null;
    }
  }, [src, loop]);

  const play = () => {
    audioRef.current?.play().catch(error => console.error("Audio play failed", error));
  };
  
  const pause = () => {
    audioRef.current?.pause();
  };
  
  const stop = () => {
    if(audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
  }

  return { play, pause, stop };
};
