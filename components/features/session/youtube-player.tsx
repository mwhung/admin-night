'use client'

import { useState, useEffect } from 'react'
import { Volume2, VolumeX, SkipForward, Pause, Play, Music2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface Playlist {
    id: string
    name: string
    description: string
    youtubePlaylistId: string
    thumbnail: string
    emoji: string
}

// Curated playlists for Admin Night focus sessions
export const PLAYLISTS: Playlist[] = [
    {
        id: 'lofi-chill',
        name: 'Lofi Chill Beats',
        description: 'Relaxing beats to focus',
        youtubePlaylistId: 'PLofht4PTcKYnaH8w5olJCI-wUVxuoMHqM',
        thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg',
        emoji: '🎵',
    },
    {
        id: 'jazz-cafe',
        name: 'Jazz Café',
        description: 'Smooth jazz for productivity',
        youtubePlaylistId: 'PLQkQfzsIUwRYqvNgKcNhqHPGg9vUoh4Qi',
        thumbnail: 'https://i.ytimg.com/vi/Dx5qFachd3A/maxresdefault.jpg',
        emoji: '☕',
    },
    {
        id: 'ambient',
        name: 'Ambient Soundscapes',
        description: 'Atmospheric calm',
        youtubePlaylistId: 'PLQ_PIlf6OzqI0Kv5U6xKKQ6ZstdnrdQ4a',
        thumbnail: 'https://i.ytimg.com/vi/sjkrrmBnpGE/maxresdefault.jpg',
        emoji: '🌙',
    },
    {
        id: 'classical',
        name: 'Classical Focus',
        description: 'Timeless concentration',
        youtubePlaylistId: 'PLLgPaQNxCDhg0bMfxnWuxJkJKnExcfvHR',
        thumbnail: 'https://i.ytimg.com/vi/4Tr0otuiQuU/maxresdefault.jpg',
        emoji: '🎻',
    },
    {
        id: 'nature',
        name: 'Nature Sounds',
        description: 'Rain, forest & ocean',
        youtubePlaylistId: 'PLw-VjHDlEOgtfY1Qs2GkuXE1SwcECnWvq',
        thumbnail: 'https://i.ytimg.com/vi/q76bMs-NwRk/maxresdefault.jpg',
        emoji: '🌿',
    },
    {
        id: 'silence',
        name: 'Silence',
        description: 'No audio',
        youtubePlaylistId: '',
        thumbnail: '',
        emoji: '🔇',
    },
]

interface PlaylistSelectorProps {
    selectedPlaylist: Playlist | null
    onSelect: (playlist: Playlist) => void
    className?: string
}

export function PlaylistSelector({ selectedPlaylist, onSelect, className }: PlaylistSelectorProps) {
    return (
        <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-3", className)}>
            {PLAYLISTS.map((playlist) => (
                <button
                    key={playlist.id}
                    onClick={() => onSelect(playlist)}
                    className={cn(
                        "relative p-4 rounded-xl border-2 transition-all text-left group overflow-hidden",
                        selectedPlaylist?.id === playlist.id
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-muted hover:border-muted-foreground/30 hover:bg-muted/30"
                    )}
                >
                    {/* Playlist emoji & name */}
                    <div className="relative z-10">
                        <span className="text-2xl mb-2 block">{playlist.emoji}</span>
                        <span className="font-medium text-sm block truncate">{playlist.name}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">{playlist.description}</span>
                    </div>

                    {/* Selection indicator */}
                    {selectedPlaylist?.id === playlist.id && (
                        <div className="absolute top-2 right-2">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        </div>
                    )}
                </button>
            ))}
        </div>
    )
}

interface YouTubePlayerProps {
    playlist: Playlist
    isPlaying: boolean
    onPlayingChange: (playing: boolean) => void
    className?: string
    minimized?: boolean
}

export function YouTubePlayer({
    playlist,
    isPlaying,
    onPlayingChange,
    className,
    minimized = false
}: YouTubePlayerProps) {
    const [isMuted, setIsMuted] = useState(false)

    // If silence is selected, show nothing
    if (playlist.id === 'silence' || !playlist.youtubePlaylistId) {
        return null
    }

    const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlist.youtubePlaylistId}&autoplay=${isPlaying ? 1 : 0}&loop=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0`

    if (minimized) {
        return (
            <div className={cn(
                "fixed bottom-4 right-4 z-40 flex items-center gap-2 px-4 py-2 rounded-full",
                "bg-card/90 backdrop-blur-md border shadow-lg",
                className
            )}>
                <span className="text-lg">{playlist.emoji}</span>
                <span className="text-sm font-medium max-w-[100px] truncate">{playlist.name}</span>

                <div className="flex items-center gap-1 ml-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPlayingChange(!isPlaying)}
                    >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setIsMuted(!isMuted)}
                    >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Hidden iframe for audio */}
                <iframe
                    src={embedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    className="absolute w-0 h-0 opacity-0 pointer-events-none"
                    title="Background Music"
                />
            </div>
        )
    }

    return (
        <div className={cn("relative rounded-xl overflow-hidden", className)}>
            {/* Video player container */}
            <div className="aspect-video w-full bg-black/90 rounded-xl overflow-hidden">
                <iframe
                    src={embedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    title="Focus Music Player"
                />
            </div>

            {/* Overlay controls */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <span className="text-lg">{playlist.emoji}</span>
                        <span className="text-sm font-medium">{playlist.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                            onClick={() => onPlayingChange(!isPlaying)}
                        >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                            onClick={() => setIsMuted(!isMuted)}
                        >
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Compact version for session view
interface MiniPlayerProps {
    playlist: Playlist | null
    isPlaying: boolean
    onPlayingChange: (playing: boolean) => void
}

export function MiniPlayer({ playlist, isPlaying, onPlayingChange }: MiniPlayerProps) {
    const [isMuted, setIsMuted] = useState(false)

    if (!playlist || playlist.id === 'silence' || !playlist.youtubePlaylistId) {
        return (
            <Button variant="ghost" size="icon" disabled>
                <VolumeX className="h-4 w-4" />
            </Button>
        )
    }

    const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlist.youtubePlaylistId}&autoplay=${isPlaying ? 1 : 0}&loop=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0`

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>

            {/* Hidden iframe for audio playback */}
            <iframe
                src={embedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="absolute w-0 h-0 opacity-0 pointer-events-none"
                title="Background Music"
            />
        </>
    )
}
