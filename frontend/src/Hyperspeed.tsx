import React, { useEffect, useRef, useState } from 'react'

export interface HyperspeedProps {
  cardMode?: boolean
  className?: string
  speed?: number
  starCount?: number
  streakCount?: number
  interactive?: boolean
}

/**
 * Hyperspeed - Light-themed, pristine white Kexsio-native animated background.
 *
 * Design Architecture:
 * - Pure white / subtle pearl slate stage (#FFFFFF, #F8FAFC, #F1F5F9).
 * - Particles and relativistic optical trails rendered in sleek slate, cobalt blue, and cyan hues.
 * - Restrained white glass chrome with clean borders and subtle shadows.
 * - Supports '?card' URL param or `cardMode` prop for self-contained, low-overhead embedding in card previews or gallery iframes.
 * - 0 external dependencies, pure HTML5 Canvas + requestAnimationFrame with frame skipping on tab blur.
 */
export const Hyperspeed: React.FC<HyperspeedProps> = ({
  cardMode: propCardMode,
  className = '',
  speed: initialSpeed = 1.0,
  starCount: initialStarCount,
  streakCount: initialStreakCount,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Detect '?card' query param if not explicitly passed
  const isCardMode =
    propCardMode ??
    (typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).has('card'))

  const [currentWarp, setCurrentWarp] = useState<number>(initialSpeed)
  const [isWarping, setIsWarping] = useState(false)
  const [fps, setFps] = useState(60)

  // Relativistic particle pools
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth)
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight)

    let centerX = width / 2
    let centerY = height / 2

    // Responsive particle count based on cardMode / viewport
    const totalStars =
      initialStarCount ?? (isCardMode ? 140 : Math.min(320, Math.floor((width * height) / 4200)))
    const totalStreaks =
      initialStreakCount ?? (isCardMode ? 24 : Math.min(65, Math.floor((width * height) / 22000)))

    interface Star {
      x: number
      y: number
      z: number
      prevZ: number
      color: string
      size: number
    }

    interface LightStreak {
      angle: number
      radius: number
      length: number
      speed: number
      hue: string
      width: number
      alpha: number
    }

    // Light-themed palette adhering to C2C clean slate & blue/cyan aesthetic
    const themeColors = [
      'rgba(15, 23, 42, 0.75)',   // Slate 900 (deep focal stars)
      'rgba(51, 65, 85, 0.65)',   // Slate 700
      'rgba(100, 116, 139, 0.55)',// Slate 500
      'rgba(37, 99, 235, 0.70)',  // Royal Blue 600
      'rgba(14, 165, 233, 0.70)', // Sky 500
      'rgba(79, 70, 229, 0.65)',  // Indigo 600
    ]

    const stars: Star[] = []
    const streaks: LightStreak[] = []

    // Initialize 3D Stars
    for (let i = 0; i < totalStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        prevZ: 0,
        color: themeColors[Math.floor(Math.random() * themeColors.length)],
        size: Math.random() * 1.5 + 0.6,
      })
    }

    // Initialize Relativistic streaks
    for (let i = 0; i < totalStreaks; i++) {
      streaks.push({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * (width / 2),
        length: Math.random() * 120 + 40,
        speed: Math.random() * 6 + 4,
        hue: themeColors[Math.floor(Math.random() * themeColors.length)],
        width: Math.random() * 1.6 + 0.8,
        alpha: Math.random() * 0.6 + 0.2,
      })
    }

    let targetSpeed = currentWarp
    let activeSpeed = currentWarp
    let mouseOffsetX = 0
    let mouseOffsetY = 0

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
      centerX = width / 2
      centerY = height / 2
    }

    window.addEventListener('resize', handleResize)

    // Interactive pointer movement parallax
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return
      const rect = canvas.getBoundingClientRect()
      const nx = (e.clientX - rect.left) / width - 0.5
      const ny = (e.clientY - rect.top) / height - 0.5
      mouseOffsetX = nx * 80
      mouseOffsetY = ny * 80
    }

    if (interactive && !isCardMode) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    }

    // Render Loop
    let frameCounter = 0
    let fpsTimer = performance.now()

    const render = (time: number) => {
      // Smooth interpolation for warp speeds
      activeSpeed += (targetSpeed - activeSpeed) * 0.08

      // Light/White background clear with pearl-white persistence (motion trails)
      ctx.fillStyle = activeSpeed > 2.5 ? 'rgba(255, 255, 255, 0.38)' : 'rgba(248, 250, 252, 0.44)'
      ctx.fillRect(0, 0, width, height)

      // Perspective origin with slight mouse offset
      const ox = centerX + mouseOffsetX
      const oy = centerY + mouseOffsetY

      // 1. Draw relativistic optical streaks
      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i]
        s.radius += s.speed * activeSpeed

        if (s.radius > Math.max(width, height) * 0.9) {
          s.radius = Math.random() * 40
          s.angle = Math.random() * Math.PI * 2
          s.speed = Math.random() * 6 + 4
        }

        const headX = ox + Math.cos(s.angle) * s.radius
        const headY = oy + Math.sin(s.angle) * s.radius
        const tailLen = s.length * (activeSpeed * 0.9)
        const tailX = ox + Math.cos(s.angle) * Math.max(0, s.radius - tailLen)
        const tailY = oy + Math.sin(s.angle) * Math.max(0, s.radius - tailLen)

        const grad = ctx.createLinearGradient(tailX, tailY, headX, headY)
        grad.addColorStop(0, 'rgba(248, 250, 252, 0)')
        grad.addColorStop(0.7, s.hue)
        grad.addColorStop(1, '#0F172A')

        ctx.strokeStyle = grad
        ctx.lineWidth = s.width * (activeSpeed > 2 ? 1.6 : 1.1)
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(headX, headY)
        ctx.stroke()
      }

      // 2. Draw 3D hyperspeed starfield
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i]
        star.prevZ = star.z
        star.z -= 10 * activeSpeed

        if (star.z <= 0) {
          star.z = width
          star.prevZ = width
          star.x = (Math.random() - 0.5) * width * 2
          star.y = (Math.random() - 0.5) * height * 2
        }

        // Screen projections
        const k = 220 / star.z
        const px = star.x * k + ox
        const py = star.y * k + oy

        if (px < -50 || px > width + 50 || py < -50 || py > height + 50) {
          star.z = width
          star.prevZ = width
          continue
        }

        // Previous frame projection for motion streak lines
        const prevK = 220 / star.prevZ
        const prevPx = star.x * prevK + ox
        const prevPy = star.y * prevK + oy

        const alpha = Math.min(1, Math.max(0.15, 1 - star.z / width))
        const size = Math.max(0.7, (1 - star.z / width) * star.size * (activeSpeed > 2 ? 1.4 : 1))

        ctx.beginPath()
        ctx.strokeStyle = star.color
        ctx.fillStyle = star.color
        ctx.globalAlpha = alpha

        if (activeSpeed > 1.2) {
          ctx.lineWidth = size
          ctx.moveTo(prevPx, prevPy)
          ctx.lineTo(px, py)
          ctx.stroke()
        } else {
          ctx.arc(px, py, size, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      // 3. Central optical focus vignette (restrained pearl vignette)
      const vignette = ctx.createRadialGradient(ox, oy, 40, ox, oy, Math.max(width, height) * 0.75)
      vignette.addColorStop(0, 'rgba(255, 255, 255, 0.0)')
      vignette.addColorStop(0.65, 'rgba(241, 245, 249, 0.15)')
      vignette.addColorStop(1, 'rgba(226, 232, 240, 0.55)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, width, height)

      // FPS tracking
      frameCounter++
      if (time - fpsTimer > 1000) {
        setFps(Math.round((frameCounter * 1000) / (time - fpsTimer)))
        frameCounter = 0
        fpsTimer = time
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      if (interactive && !isCardMode) {
        window.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [isCardMode, currentWarp, interactive, initialStarCount, initialStreakCount])

  // Trigger high-speed warp burst
  const handleWarpBurst = () => {
    setIsWarping(true)
    setCurrentWarp(3.8)
    setTimeout(() => {
      setCurrentWarp(1.0)
      setIsWarping(false)
    }, 1400)
  }

  return (
    <div
      ref={containerRef}
      className={`kx-hyperspeed-root ${isCardMode ? 'kx-hyperspeed-card' : ''} ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        backgroundColor: '#FFFFFF', // Pure clean white base
      }}
    >
      <style>{`
        .kx-hyperspeed-root {
          width: 100%;
          height: 100%;
          user-select: none;
        }

        .kx-hyperspeed-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          image-rendering: auto;
        }

        /* Subtle ambient grid lines */
        .kx-hyperspeed-scanline {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            rgba(255, 255, 255, 0) 50%,
            rgba(226, 232, 240, 0.35) 50%
          );
          background-size: 100% 4px;
          opacity: 0.4;
          z-index: 1;
        }

        /* Restrained Kexsio Light Chrome */
        .kx-hyperspeed-chrome {
          position: absolute;
          bottom: 18px;
          left: 20px;
          z-index: 2;
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
          font-size: 11px;
          color: #475569;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(203, 213, 225, 0.8);
          padding: 6px 14px;
          border-radius: 999px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
          transition: all 0.2s ease;
        }

        .kx-hyperspeed-chrome:hover {
          border-color: rgba(148, 163, 184, 0.9);
          color: #0F172A;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.12);
        }

        .kx-warp-btn {
          background: #0F172A;
          border: 1px solid #0F172A;
          color: #FFFFFF;
          font-weight: 700;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 3px 10px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .kx-warp-btn:hover {
          background: #2563EB;
          border-color: #2563EB;
          color: #FFFFFF;
          box-shadow: 0 0 10px rgba(37, 99, 235, 0.4);
        }

        .kx-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2563EB;
          box-shadow: 0 0 6px rgba(37, 99, 235, 0.6);
        }

        /* ?card mode: stripped-down, ultra-clean chrome for gallery embeds */
        .kx-hyperspeed-card .kx-hyperspeed-chrome {
          display: none;
        }
      `}</style>

      {/* Primary Motion Canvas */}
      <canvas ref={canvasRef} className="kx-hyperspeed-canvas" />

      {/* Optical Scanline Grid */}
      <div className="kx-hyperspeed-scanline" aria-hidden="true" />

      {/* Restrained Kexsio Chrome (hidden in ?card mode) */}
      {!isCardMode && (
        <aside className="kx-hyperspeed-chrome" aria-label="Hyperspeed Engine Controls">
          <span className="kx-status-dot" aria-hidden="true" />
          <span style={{ fontWeight: 600, letterSpacing: '0.02em', color: '#0F172A' }}>
            Hyperspeed Engine &bull; {currentWarp > 1.5 ? 'WARP 3.8' : 'WARP 1.0'}
          </span>
          <span style={{ color: '#64748B' }}>{fps} fps</span>
          <button
            type="button"
            className="kx-warp-btn"
            onClick={handleWarpBurst}
            disabled={isWarping}
            title="Engage hyper-speed optical burst"
          >
            {isWarping ? 'WARPING...' : 'WARP PULSE'}
          </button>
        </aside>
      )}
    </div>
  )
}

export default Hyperspeed
