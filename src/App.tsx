import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { QrPreviewCard } from './components/QrPreviewCard'
import {
  QR_SIZES,
  type QrSize,
  buildDownloadFilename,
  downloadSvgContent,
  generateQrDataUrl,
  generateQrSvg,
  normalizeQrInput,
  triggerBrowserDownload,
} from './utils/qrExport'

export function App() {
  const [inputValue, setInputValue] = useState('')
  const [encodedText, setEncodedText] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<QrSize>(512)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Re-render PNG data URL whenever the generated text or selected export size changes
  useEffect(() => {
    if (!encodedText) {
      setQrDataUrl(null)
      return
    }

    let cancelled = false
    setIsGenerating(true)

    generateQrDataUrl(encodedText, selectedSize)
      .then((dataUrl) => {
        if (!cancelled) {
          setQrDataUrl(dataUrl)
          setErrorMessage(null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage('Could not generate QR code for this input.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsGenerating(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [encodedText, selectedSize])

  const handleGenerate = (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const normalized = normalizeQrInput(inputValue)
      setErrorMessage(null)
      setEncodedText(normalized)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Invalid input.')
      inputRef.current?.focus()
    }
  }

  const handleClear = () => {
    setInputValue('')
    setEncodedText(null)
    setQrDataUrl(null)
    setErrorMessage(null)
    inputRef.current?.focus()
  }

  const handleDownloadPng = async () => {
    if (!encodedText) {
      inputRef.current?.focus()
      return
    }
    const url = qrDataUrl ?? (await generateQrDataUrl(encodedText, selectedSize))
    const filename = buildDownloadFilename(encodedText, 'png', selectedSize)
    triggerBrowserDownload(url, filename)
  }

  const handleDownloadSvg = async () => {
    if (!encodedText) {
      setErrorMessage('Generate a QR code first before exporting SVG.')
      inputRef.current?.focus()
      return
    }
    const svg = await generateQrSvg(encodedText)
    const filename = buildDownloadFilename(encodedText, 'svg')
    downloadSvgContent(svg, filename)
  }

  return (
    <main className="page-backdrop">
      <section className="hero-card">
        <header className="hero-topbar">
          <button
            type="button"
            className="pill-button pill-button--accent"
            disabled={!encodedText || isGenerating}
            onClick={handleDownloadPng}
          >
            Download PNG
          </button>
        </header>

        <div className="hero-grid">
          <div className="controls-column">
            <h1 className="hero-title">Generate QR cleanly</h1>
            <p className="hero-subtitle">
              Paste any link or text below, click generate, and download crisp QR codes in
              multiple sizes for personal use.
            </p>

            <form className="qr-form" onSubmit={handleGenerate} noValidate>
              <div className={`input-wrapper ${errorMessage ? 'input-wrapper--error' : ''}`}>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                    if (errorMessage) setErrorMessage(null)
                  }}
                  placeholder="https://example.com/my-project"
                  aria-label="Text or link for QR code"
                  className="text-input"
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="clear-button"
                    aria-label="Clear input"
                    title="Clear"
                  >
                    <X size={16} strokeWidth={1.8} />
                  </button>
                )}
              </div>

              {errorMessage && (
                <p className="input-error" role="alert">
                  {errorMessage}
                </p>
              )}

              <div className="size-section">
                <span className="size-label">Export size</span>
                <div className="size-pills" role="group" aria-label="Export PNG size">
                  {QR_SIZES.map((size) => {
                    const isActive = selectedSize === size
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        aria-pressed={isActive}
                        className={`size-pill ${isActive ? 'size-pill--active' : ''}`}
                      >
                        {size}px
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="actions-row">
                <button type="submit" className="pill-button pill-button--dark">
                  Generate QR
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  disabled={!encodedText || isGenerating}
                  className="pill-button pill-button--outline"
                >
                  Export SVG
                </button>
              </div>
            </form>
          </div>

          <div className="preview-column">
            <QrPreviewCard
              qrDataUrl={qrDataUrl}
              encodedText={encodedText}
              selectedSize={selectedSize}
              isGenerating={isGenerating}
              onDownloadPng={handleDownloadPng}
            />
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
