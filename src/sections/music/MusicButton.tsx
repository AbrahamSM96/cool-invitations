'use client'

import { INVITATION_OPEN_EVENT } from '@/lib/invitation-events'
import { type ReactNode, useEffect, useRef, useState } from 'react'

interface MusicButtonProps {
  url: string
}

/**
 * Floating play/pause button. Starts playing when the envelope opens.
 *
 * @param props - Button props.
 * @param props.url - MP3 file URL.
 */
export function MusicButton({ url }: MusicButtonProps): ReactNode {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    /**
     * Plays the song inside the envelope's click gesture.
     */
    const play = (): void => {
      void audioRef.current?.play().catch(() => undefined)
    }
    window.addEventListener(INVITATION_OPEN_EVENT, play)
    return (): void => window.removeEventListener(INVITATION_OPEN_EVENT, play)
  }, [])

  return (
    <>
      {/* oxlint-disable-next-line jsx-a11y/media-has-caption -- background music */}
      <audio
        loop
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        preload="none"
        ref={audioRef}
        src={url}
      />
      <button
        aria-label={playing ? 'Pausar música' : 'Reproducir música'}
        className="absolute right-4 bottom-20 z-20 flex size-11 items-center justify-center rounded-full bg-inv-strong text-inv-on-strong shadow-lg"
        onClick={() => {
          const audio = audioRef.current
          if (!audio) return
          if (audio.paused) void audio.play()
          else audio.pause()
        }}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="size-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          {playing ? (
            <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
          ) : (
            <path d="M9 17.5a2.5 2.5 0 1 1-2-2.45V5l11-2v11.5a2.5 2.5 0 1 1-2-2.45V6.4L9 7.7z" />
          )}
        </svg>
      </button>
    </>
  )
}
