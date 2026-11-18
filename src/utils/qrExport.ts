import QRCode from 'qrcode'

export const QR_SIZES = [256, 512, 1024, 2048] as const

export type QrSize = (typeof QR_SIZES)[number]

const QR_COLORS = {
  dark: '#111827',
  light: '#FFFFFF',
} as const

/**
 * Validates and normalizes user input before encoding it into a QR code.
 */
export function normalizeQrInput(rawText: string): string {
  const trimmed = rawText.trim()
  if (!trimmed) {
    throw new Error('Please enter a link or text to generate a QR code.')
  }
  return trimmed
}

/**
 * Generates a PNG Data URL of the QR code at the exact requested pixel width.
 */
export async function generateQrDataUrl(rawText: string, size: QrSize): Promise<string> {
  const text = normalizeQrInput(rawText)
  return QRCode.toDataURL(text, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: QR_COLORS,
  })
}

/**
 * Generates a crisp vector SVG string of the QR code.
 */
export async function generateQrSvg(rawText: string): Promise<string> {
  const text = normalizeQrInput(rawText)
  return QRCode.toString(text, {
    type: 'svg',
    margin: 2,
    errorCorrectionLevel: 'M',
    color: QR_COLORS,
  })
}

/**
 * Creates a clean, filesystem-safe filename for downloaded QR exports.
 */
export function buildDownloadFilename(
  rawText: string,
  extension: 'png' | 'svg',
  size?: QrSize,
): string {
  const cleaned = rawText
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
    .toLowerCase()

  const base = cleaned ? `qrcode-${cleaned}` : 'qrcode'
  const sizeSuffix = extension === 'png' && size ? `-${size}px` : ''
  return `${base}${sizeSuffix}.${extension}`
}

/**
 * Triggers a browser download from a Data URL or Object URL.
 */
export function triggerBrowserDownload(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Downloads an SVG string as a `.svg` file using a temporary Blob URL.
 */
export function downloadSvgContent(svgContent: string, filename: string): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  try {
    triggerBrowserDownload(objectUrl, filename)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
