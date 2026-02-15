import { NextRequest, NextResponse } from 'next/server'
import { SoundscapeId, isSoundscapeId } from '@/lib/session/soundscapes'

export const runtime = 'nodejs'

const SAMPLE_RATE = 22050
const BIT_DEPTH = 16
const CHANNELS = 1
const DURATION_SECONDS = 18
const TRACK_ID_PATTERN = /^track-(\d{1,2})$/

interface SoundProfile {
  tonalBaseHz: number
  driftHz: number
  noiseAmount: number
  noisePulseHz: number
  harmonics: number[]
  gain: number
}

const PROFILE_BY_SOUNDSCAPE: Record<Exclude<SoundscapeId, 'silence'>, SoundProfile> = {
  'ledger-rain': {
    tonalBaseHz: 92,
    driftHz: 0.021,
    noiseAmount: 0.22,
    noisePulseHz: 0.05,
    harmonics: [1, 2, 3.01],
    gain: 0.47,
  },
  'reimbursement-cafe': {
    tonalBaseHz: 122,
    driftHz: 0.018,
    noiseAmount: 0.18,
    noisePulseHz: 0.06,
    harmonics: [1, 1.5, 2.01],
    gain: 0.43,
  },
  'inbox-breeze': {
    tonalBaseHz: 175,
    driftHz: 0.015,
    noiseAmount: 0.14,
    noisePulseHz: 0.08,
    harmonics: [1, 2, 2.7],
    gain: 0.42,
  },
  'receipt-lab': {
    tonalBaseHz: 145,
    driftHz: 0.012,
    noiseAmount: 0.11,
    noisePulseHz: 0.07,
    harmonics: [1, 2.01, 4.02],
    gain: 0.37,
  },
  'deep-focus-desk': {
    tonalBaseHz: 84,
    driftHz: 0.011,
    noiseAmount: 0.09,
    noisePulseHz: 0.04,
    harmonics: [1, 1.99, 2.98],
    gain: 0.45,
  },
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min
  if (value > max) return max
  return value
}

function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t += 0x6D2B79F5
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function writeWavHeader(view: DataView, dataSize: number): void {
  const byteRate = SAMPLE_RATE * CHANNELS * (BIT_DEPTH / 8)
  const blockAlign = CHANNELS * (BIT_DEPTH / 8)

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, CHANNELS, true)
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, BIT_DEPTH, true)
  writeString(36, 'data')
  view.setUint32(40, dataSize, true)
}

function synthesizeSoundscape(
  soundscapeId: Exclude<SoundscapeId, 'silence'>,
  trackNumber: number
): Uint8Array {
  const profile = PROFILE_BY_SOUNDSCAPE[soundscapeId]
  const sampleCount = SAMPLE_RATE * DURATION_SECONDS
  const bytesPerSample = BIT_DEPTH / 8
  const dataSize = sampleCount * CHANNELS * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  writeWavHeader(view, dataSize)

  const random = mulberry32(hashString(`${soundscapeId}:${trackNumber}`))
  const harmonicPhases = profile.harmonics.map(() => random() * Math.PI * 2)
  const noisePhase = random() * Math.PI * 2
  const movementPhase = random() * Math.PI * 2
  const driftPhase = random() * Math.PI * 2

  let writeOffset = 44
  for (let i = 0; i < sampleCount; i += 1) {
    const time = i / SAMPLE_RATE
    const fadeIn = Math.min(1, time / 1.8)
    const fadeOut = Math.min(1, (DURATION_SECONDS - time) / 1.8)
    const envelope = Math.max(0, Math.min(fadeIn, fadeOut))

    const drift = Math.sin((Math.PI * 2 * profile.driftHz * time) + driftPhase) * 0.018

    let tone = 0
    for (let harmonicIndex = 0; harmonicIndex < profile.harmonics.length; harmonicIndex += 1) {
      const harmonic = profile.harmonics[harmonicIndex]
      const amplitude = 1 / (harmonicIndex + 1.3)
      const harmonicFrequency = profile.tonalBaseHz * harmonic * (1 + drift)
      const phase = harmonicPhases[harmonicIndex]
      tone += Math.sin((Math.PI * 2 * harmonicFrequency * time) + phase) * amplitude
    }

    const movement = Math.sin((Math.PI * 2 * 0.013 * time) + movementPhase) * 0.12
    const noisePulse = 0.55 + 0.45 * Math.sin((Math.PI * 2 * profile.noisePulseHz * time) + noisePhase)
    const noise = (random() * 2 - 1) * profile.noiseAmount * noisePulse

    const rawSignal = ((tone * 0.24) + movement + noise) * profile.gain * envelope
    const normalizedSignal = clamp(rawSignal, -0.98, 0.98)
    view.setInt16(writeOffset, Math.round(normalizedSignal * 32767), true)
    writeOffset += 2
  }

  return new Uint8Array(buffer)
}

function synthesizeSilence(): Uint8Array {
  const sampleCount = SAMPLE_RATE * DURATION_SECONDS
  const bytesPerSample = BIT_DEPTH / 8
  const dataSize = sampleCount * CHANNELS * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  writeWavHeader(view, dataSize)
  return new Uint8Array(buffer)
}

function resolveTrackNumber(trackParam: string | null): number {
  if (!trackParam) return 1

  const match = TRACK_ID_PATTERN.exec(trackParam)
  if (!match) return 1

  const parsed = Number.parseInt(match[1], 10)
  if (!Number.isFinite(parsed)) return 1

  return clamp(parsed, 1, 12)
}

export async function GET(request: NextRequest) {
  const soundscape = request.nextUrl.searchParams.get('soundscape')
  if (!isSoundscapeId(soundscape)) {
    return NextResponse.json({ error: 'Invalid soundscape' }, { status: 400 })
  }

  const trackNumber = resolveTrackNumber(request.nextUrl.searchParams.get('track'))

  const payload = soundscape === 'silence'
    ? synthesizeSilence()
    : synthesizeSoundscape(soundscape, trackNumber)

  return new NextResponse(Buffer.from(payload), {
    headers: {
      'Content-Type': 'audio/wav',
      'Cache-Control': 'public, max-age=86400, immutable',
      'X-Soundscape-Id': soundscape,
      'X-Track-Number': String(trackNumber),
    },
  })
}
