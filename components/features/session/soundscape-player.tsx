'use client'

import { useEffect, useMemo, useRef } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Waves,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cardLayout } from '@/components/ui/card-layouts'
import { cn } from '@/lib/utils'
import {
  SOUNDSCAPES,
  SILENCE_SOUNDSCAPE_ID,
  clampSoundscapeVolume,
  getSoundscapeById,
  normalizeTrackIndex,
  type SoundscapeId,
  type SoundscapePlaybackState,
} from '@/lib/session/soundscapes'

interface SoundscapeSelectorProps {
  selectedSoundscapeId: SoundscapeId
  onSelect: (soundscapeId: SoundscapeId) => void
  className?: string
}

interface SessionSoundscapePlayerProps {
  playback: SoundscapePlaybackState
  onPlaybackChange: (patch: Partial<SoundscapePlaybackState>) => void
  className?: string
}

export function SoundscapeSelector({
  selectedSoundscapeId,
  onSelect,
  className,
}: SoundscapeSelectorProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3', className)}>
      {SOUNDSCAPES.map((soundscape) => {
        const selected = soundscape.id === selectedSoundscapeId

        return (
          <button
            key={soundscape.id}
            type="button"
            onClick={() => onSelect(soundscape.id)}
            className={cn(
              'rounded-xl border p-3 text-left transition-all duration-150',
              selected
                ? 'border-[var(--task-selected-border-strong)] bg-[var(--task-selected-bg-soft)] shadow-[0_10px_20px_rgba(74,102,131,0.14)]'
                : 'border-border/65 bg-surface-elevated/35 hover:border-border/90 hover:bg-surface-elevated/65'
            )}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <span className="text-xl" aria-hidden="true">{soundscape.emoji}</span>
              {selected ? <Waves className="h-4 w-4 text-primary" /> : null}
            </div>
            <p className="text-sm font-medium text-foreground">{soundscape.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{soundscape.description}</p>
            <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground/80">
              {soundscape.intentLabel}
            </p>
          </button>
        )
      })}
    </div>
  )
}

export function SessionSoundscapePlayer({
  playback,
  onPlaybackChange,
  className,
}: SessionSoundscapePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playbackRef = useRef(playback)
  const loadedTrackSourceRef = useRef<string | null>(null)

  const soundscape = useMemo(
    () => getSoundscapeById(playback.soundscapeId),
    [playback.soundscapeId]
  )
  const trackCount = soundscape.tracks.length
  const trackIndex = normalizeTrackIndex(playback.trackIndex, trackCount)
  const track = soundscape.tracks[trackIndex] ?? null

  useEffect(() => {
    playbackRef.current = playback
  }, [playback])

  useEffect(() => {
    if (playback.trackIndex === trackIndex) return
    onPlaybackChange({ trackIndex })
  }, [playback.trackIndex, trackIndex, onPlaybackChange])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = clampSoundscapeVolume(playback.volume)
  }, [playback.volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!track) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      loadedTrackSourceRef.current = null
      if (playback.isPlaying) {
        onPlaybackChange({ isPlaying: false })
      }
      return
    }

    if (loadedTrackSourceRef.current !== track.source) {
      audio.src = track.source
      audio.currentTime = 0
      audio.load()
      loadedTrackSourceRef.current = track.source
    }
  }, [track, onPlaybackChange, playback.isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!track || !playback.isPlaying) {
      audio.pause()
      return
    }

    const playPromise = audio.play()
    if (!playPromise) return

    playPromise.catch(() => {
      onPlaybackChange({ isPlaying: false })
    })
  }, [track, playback.isPlaying, onPlaybackChange])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      const latest = playbackRef.current
      const latestSoundscape = getSoundscapeById(latest.soundscapeId)
      const latestTrackCount = latestSoundscape.tracks.length
      const latestIndex = normalizeTrackIndex(latest.trackIndex, latestTrackCount)

      if (latestTrackCount <= 0) {
        onPlaybackChange({ isPlaying: false })
        return
      }

      const wrappedIndex = (latestIndex + 1) % latestTrackCount
      onPlaybackChange({ trackIndex: wrappedIndex, isPlaying: true })
    }

    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [onPlaybackChange])

  const isSilentMode = playback.soundscapeId === SILENCE_SOUNDSCAPE_ID || !track
  const handleSkipNext = () => {
    if (trackCount <= 0) return

    const wrappedIndex = (trackIndex + 1) % trackCount
    onPlaybackChange({ trackIndex: wrappedIndex, isPlaying: true })
  }

  const handleSkipPrevious = () => {
    if (trackCount <= 0) return

    const previousIndex = (trackIndex - 1 + trackCount) % trackCount

    onPlaybackChange({ trackIndex: previousIndex, isPlaying: true })
  }

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return

    navigator.mediaSession.playbackState = playback.isPlaying ? 'playing' : 'paused'
  }, [playback.isPlaying])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track ? track.title : 'Silence',
      artist: 'Admin Night',
      album: soundscape.name,
    })

    const registerAction = (
      action: MediaSessionAction,
      handler: MediaSessionActionHandler | null
    ) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler)
      } catch {
        // Ignore unsupported Media Session actions.
      }
    }

    const resolveSkip = (direction: 'next' | 'previous') => {
      const latest = playbackRef.current
      const latestSoundscape = getSoundscapeById(latest.soundscapeId)
      const latestTrackCount = latestSoundscape.tracks.length
      const latestTrackIndex = normalizeTrackIndex(latest.trackIndex, latestTrackCount)

      if (latestTrackCount <= 0) return

      if (direction === 'next') {
        const wrappedIndex = (latestTrackIndex + 1) % latestTrackCount
        onPlaybackChange({ trackIndex: wrappedIndex, isPlaying: true })
        return
      }

      const previousIndex = (latestTrackIndex - 1 + latestTrackCount) % latestTrackCount
      onPlaybackChange({ trackIndex: previousIndex, isPlaying: true })
    }

    registerAction('play', () => onPlaybackChange({ isPlaying: true }))
    registerAction('pause', () => onPlaybackChange({ isPlaying: false }))
    registerAction('nexttrack', () => resolveSkip('next'))
    registerAction('previoustrack', () => resolveSkip('previous'))

    return () => {
      registerAction('play', null)
      registerAction('pause', null)
      registerAction('nexttrack', null)
      registerAction('previoustrack', null)
    }
  }, [onPlaybackChange, soundscape.name, track])

  return (
    <div
      className={cn(
        cardLayout.workbenchSecondary,
        'workbench-pad-card-tight py-2.5 sm:py-3',
        className
      )}
    >
      <div className="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
        <div className="min-w-0 space-y-0.5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Soundscape</p>
          <p className="truncate text-sm font-medium text-foreground">
            {soundscape.emoji} {soundscape.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {track ? track.title : 'Silent mode'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 md:justify-self-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-border/80"
            onClick={handleSkipPrevious}
            disabled={isSilentMode}
            aria-label="Previous track"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            className="h-10 w-10 rounded-full shadow-sm"
            onClick={() => onPlaybackChange({ isPlaying: !playback.isPlaying })}
            disabled={isSilentMode}
            aria-label={playback.isPlaying ? 'Pause soundscape' : 'Play soundscape'}
          >
            {playback.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-border/80"
            onClick={handleSkipNext}
            disabled={isSilentMode}
            aria-label="Next track"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-xl border border-border/65 bg-surface-elevated/52 px-2.5 py-2 md:min-w-[210px] md:justify-self-end">
          <div className="rounded-full border border-border/70 bg-background/65 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {isSilentMode ? 'Track --' : `Track ${trackIndex + 1}/${trackCount}`}
          </div>

          <label
            className="flex items-center gap-1.5"
            aria-label="Soundscape volume"
          >
            <Volume2 className="h-4 w-4 text-muted-foreground/90" />
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(clampSoundscapeVolume(playback.volume) * 100)}
              onChange={(event) => {
                const rawValue = Number.parseInt(event.target.value, 10)
                onPlaybackChange({ volume: clampSoundscapeVolume(rawValue / 100) })
              }}
              className="h-1.5 w-16 cursor-pointer appearance-none rounded-full bg-muted accent-primary sm:w-20 md:w-24"
            />
            <span className="w-9 text-right text-xs font-medium text-muted-foreground">
              {Math.round(clampSoundscapeVolume(playback.volume) * 100)}%
            </span>
          </label>
        </div>
      </div>

      <audio ref={audioRef} preload="auto" />
    </div>
  )
}
