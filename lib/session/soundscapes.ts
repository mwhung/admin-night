export type SoundscapeId =
  | 'ledger-rain'
  | 'reimbursement-cafe'
  | 'inbox-breeze'
  | 'receipt-lab'
  | 'deep-focus-desk'
  | 'silence'

export type SoundscapeLoopMode = 'none' | 'all' | 'single'

export interface SoundscapeTrack {
  id: string
  title: string
  source: string
}

export interface SoundscapeDefinition {
  id: SoundscapeId
  name: string
  description: string
  emoji: string
  intentLabel: string
  tracks: SoundscapeTrack[]
}

export interface SoundscapePlaybackState {
  soundscapeId: SoundscapeId
  trackIndex: number
  isPlaying: boolean
  volume: number
  shuffle: boolean
  loopMode: SoundscapeLoopMode
}

export interface SoundscapePreferencePayload {
  soundscape_id: SoundscapeId
  soundscape_volume: number
  soundscape_shuffle: boolean
  soundscape_loop_mode: SoundscapeLoopMode
}

export const SILENCE_SOUNDSCAPE_ID: SoundscapeId = 'silence'
export const DEFAULT_SOUNDSCAPE_ID: SoundscapeId = 'ledger-rain'
export const DEFAULT_SOUNDSCAPE_VOLUME = 0.45
export const DEFAULT_SOUNDSCAPE_LOOP_MODE: SoundscapeLoopMode = 'all'

const buildTrack = (soundscapeId: SoundscapeId, trackNumber: number, title: string): SoundscapeTrack => ({
  id: `track-${trackNumber}`,
  title,
  source: `/api/soundscapes/audio?soundscape=${soundscapeId}&track=track-${trackNumber}`,
})

export const SOUNDSCAPES: SoundscapeDefinition[] = [
  {
    id: 'ledger-rain',
    name: 'Ledger Rain',
    description: 'Gentle rain with low pads for bookkeeping blocks.',
    emoji: '🌧️',
    intentLabel: 'Sorting finances',
    tracks: [
      buildTrack('ledger-rain', 1, 'Rain Over Receipts'),
      buildTrack('ledger-rain', 2, 'Nightly Reconciliation'),
      buildTrack('ledger-rain', 3, 'Balanced Columns'),
    ],
  },
  {
    id: 'reimbursement-cafe',
    name: 'Reimbursement Cafe',
    description: 'Soft room hum for claim and reimbursement work.',
    emoji: '☕',
    intentLabel: 'Expense claims',
    tracks: [
      buildTrack('reimbursement-cafe', 1, 'Quiet Counter'),
      buildTrack('reimbursement-cafe', 2, 'Warm Lamp Table'),
      buildTrack('reimbursement-cafe', 3, 'Slow Service Queue'),
    ],
  },
  {
    id: 'inbox-breeze',
    name: 'Inbox Breeze',
    description: 'Airy texture that keeps email replies calm and steady.',
    emoji: '📨',
    intentLabel: 'Replying emails',
    tracks: [
      buildTrack('inbox-breeze', 1, 'Window Draft'),
      buildTrack('inbox-breeze', 2, 'Inbox Drift'),
      buildTrack('inbox-breeze', 3, 'Pending Replies'),
    ],
  },
  {
    id: 'receipt-lab',
    name: 'Receipt Lab',
    description: 'Clean low-noise loop for scanning and filing receipts.',
    emoji: '🧾',
    intentLabel: 'Receipt scanning',
    tracks: [
      buildTrack('receipt-lab', 1, 'Flatbed Glow'),
      buildTrack('receipt-lab', 2, 'Archive Drawer'),
      buildTrack('receipt-lab', 3, 'Clean Capture'),
    ],
  },
  {
    id: 'deep-focus-desk',
    name: 'Deep Focus Desk',
    description: 'Steady sustained tones for heavy admin review.',
    emoji: '🕯️',
    intentLabel: 'Deep review',
    tracks: [
      buildTrack('deep-focus-desk', 1, 'Single Tab Focus'),
      buildTrack('deep-focus-desk', 2, 'Midnight Processing'),
      buildTrack('deep-focus-desk', 3, 'Final Pass'),
    ],
  },
  {
    id: 'silence',
    name: 'Silence',
    description: 'No background sound.',
    emoji: '🔇',
    intentLabel: 'Silent mode',
    tracks: [],
  },
]

export const SOUNDSCAPE_IDS = SOUNDSCAPES.map((soundscape) => soundscape.id)

const SOUNDSCAPE_ID_SET = new Set<string>(SOUNDSCAPE_IDS)
const SOUNDSCAPE_LOOP_MODE_SET = new Set<SoundscapeLoopMode>(['none', 'all', 'single'])

export function isSoundscapeId(value: unknown): value is SoundscapeId {
  return typeof value === 'string' && SOUNDSCAPE_ID_SET.has(value)
}

export function isSoundscapeLoopMode(value: unknown): value is SoundscapeLoopMode {
  return typeof value === 'string' && SOUNDSCAPE_LOOP_MODE_SET.has(value as SoundscapeLoopMode)
}

export function getSoundscapeById(soundscapeId: SoundscapeId): SoundscapeDefinition {
  return SOUNDSCAPES.find((soundscape) => soundscape.id === soundscapeId) ?? SOUNDSCAPES[0]
}

export function clampSoundscapeVolume(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SOUNDSCAPE_VOLUME
  if (value < 0) return 0
  if (value > 1) return 1
  return Math.round(value * 100) / 100
}

export function normalizeTrackIndex(trackIndex: number, trackCount: number): number {
  if (trackCount <= 0) return 0
  if (!Number.isFinite(trackIndex)) return 0

  const normalized = Math.floor(trackIndex)
  if (normalized < 0) return 0
  if (normalized >= trackCount) return trackCount - 1
  return normalized
}

export function buildDefaultSoundscapePlaybackState(
  soundscapeId: SoundscapeId = DEFAULT_SOUNDSCAPE_ID
): SoundscapePlaybackState {
  return {
    soundscapeId,
    trackIndex: 0,
    isPlaying: soundscapeId !== SILENCE_SOUNDSCAPE_ID,
    volume: DEFAULT_SOUNDSCAPE_VOLUME,
    shuffle: false,
    loopMode: DEFAULT_SOUNDSCAPE_LOOP_MODE,
  }
}
