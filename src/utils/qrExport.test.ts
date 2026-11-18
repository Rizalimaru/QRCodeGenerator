import { describe, expect, it } from 'vitest'
import {
  QR_SIZES,
  buildDownloadFilename,
  generateQrDataUrl,
  generateQrSvg,
  normalizeQrInput,
} from './qrExport'

function readPngDimensions(dataUrl: string): { width: number; height: number } {
  const base64 = dataUrl.split(',')[1]
  const bytes = Buffer.from(base64, 'base64')
  // PNG IHDR chunk stores width at byte offset 16 and height at 20 (big-endian uint32)
  const width = bytes.readUInt32BE(16)
  const height = bytes.readUInt32BE(20)
  return { width, height }
}

describe('qrExport utilities', () => {
  it('trims valid input and rejects empty or whitespace-only text', () => {
    expect(normalizeQrInput('  https://example.com  ')).toBe('https://example.com')
    expect(() => normalizeQrInput('')).toThrow()
    expect(() => normalizeQrInput('   \n\t  ')).toThrow()
  })

  it('generates PNG data URLs at every supported export size', async () => {
    for (const size of QR_SIZES) {
      const dataUrl = await generateQrDataUrl('https://example.com/my-project', size)
      expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true)
      const dimensions = readPngDimensions(dataUrl)
      expect(dimensions).toEqual({ width: size, height: size })
    }
  })

  it('generates valid SVG markup for the encoded text', async () => {
    const svg = await generateQrSvg('Hello QR Studio')
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
    expect(svg).toContain('<path')
  })

  it('builds sanitized download filenames with size suffixes for PNG', () => {
    expect(buildDownloadFilename('https://example.com/my-project', 'png', 512)).toBe(
      'qrcode-example-com-my-project-512px.png',
    )
    expect(buildDownloadFilename('https://example.com/my-project', 'svg')).toBe(
      'qrcode-example-com-my-project.svg',
    )
    expect(buildDownloadFilename('***', 'png', 1024)).toBe('qrcode-1024px.png')
  })
})
