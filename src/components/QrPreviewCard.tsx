import { QrCode } from 'lucide-react'
import type { QrSize } from '../utils/qrExport'

interface QrPreviewCardProps {
  qrDataUrl: string | null
  encodedText: string | null
  selectedSize: QrSize
  isGenerating: boolean
  onDownloadPng: () => void
}

/**
 * Floating minimalist device-frame card displaying the generated QR preview and quick save CTA.
 */
export function QrPreviewCard({
  qrDataUrl,
  encodedText,
  selectedSize,
  isGenerating,
  onDownloadPng,
}: QrPreviewCardProps) {
  const hasQr = Boolean(qrDataUrl && encodedText)

  return (
    <aside className="device-frame" aria-label="QR Code Preview">
      <div className="device-speaker" aria-hidden="true" />

      <div className="device-screen">
        <span className="device-screen-title">QR Preview</span>

        <div className="qr-surface">
          {hasQr && qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR code for ${encodedText}`}
              className="qr-image"
            />
          ) : (
            <div className="qr-placeholder">
              <QrCode size={44} strokeWidth={1.35} className="qr-placeholder-icon" />
              <span className="qr-placeholder-text">
                {isGenerating ? 'Generating...' : 'Ready to generate'}
              </span>
            </div>
          )}
        </div>

        <p
          className={`encoded-label ${hasQr ? '' : 'encoded-label--muted'}`}
          title={encodedText ?? undefined}
        >
          {encodedText ?? 'Enter a link or text on the left'}
        </p>

        <button
          type="button"
          className="pill-button pill-button--accent pill-button--compact"
          disabled={!hasQr || isGenerating}
          onClick={onDownloadPng}
        >
          Save {selectedSize}×{selectedSize}
        </button>
      </div>

      <div className="device-home-circle" aria-hidden="true" />
    </aside>
  )
}
