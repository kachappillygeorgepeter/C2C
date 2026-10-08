import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface ThreeDCarouselItem {
  id: string
  label: string
  description?: string
  countLabel?: string
  badge?: string
  icon: React.ReactNode
  onClick?: () => void
}

export interface ThreeDCarouselProps {
  items: ThreeDCarouselItem[]
  onItemClick?: (item: ThreeDCarouselItem) => void
  /** Full rotation duration in seconds for constant auto-spin. Default: 45s */
  spinDuration?: number
  /** Delay in seconds to resume auto-rotation after user interaction stops. Default: 1.8s */
  resumeDelay?: number
  className?: string
}

/**
 * ThreeDCarousel (Cylinder Carousel)
 *
 * Highly refined 3D Cylinder wheel carousel:
 * - Constant delta-time continuous rotation (useAnimationFrame / rAF)
 * - Pure angular rotation with info.delta (no wild acceleration or x-slide)
 * - Inertia decay upon release that smoothly transitions into auto-spin
 * - Arrow buttons / key navigation rotate exactly 360/count degrees
 * - Radius math automatically adapts to item count and viewport width
 * - Accessible, keyboard focusable, respects prefers-reduced-motion
 */
export function ThreeDCarousel({
  items,
  onItemClick,
  spinDuration = 45,
  resumeDelay = 1.8,
  className = ''
}: ThreeDCarouselProps) {
  // If fewer than 4 items, duplicate items evenly so cylinder geometry looks full and circular
  const effectiveItems = useMemo(() => {
    if (!items || items.length === 0) return []
    if (items.length < 3) {
      return [...items, ...items, ...items]
    }
    if (items.length === 3) {
      return [...items, ...items]
    }
    return items
  }, [items])

  const count = effectiveItems.length
  const anglePerItem = 360 / count

  // Responsive card dimensions
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  )

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = viewportWidth < 640
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024

  // Card size calculations
  const cardWidth = isMobile ? 220 : isTablet ? 260 : 300
  const cardHeight = isMobile ? 180 : 200
  const gap = isMobile ? 16 : 24

  // Dynamic cylinder radius: (cardWidth + gap) / (2 * tan(PI / count))
  // Clamped with safety bounds so small counts or large screens maintain ideal depth
  const radius = useMemo(() => {
    if (count <= 1) return 180
    const calculated = Math.round((cardWidth + gap) / (2 * Math.tan(Math.PI / count)))
    const minRadius = isMobile ? 210 : 310
    const maxRadius = isMobile ? 380 : 640
    return Math.max(minRadius, Math.min(maxRadius, calculated))
  }, [cardWidth, gap, count, isMobile])

  // Framer Motion rotation values
  const rotation = useMotionValue(0)
  // Spring with low stiffness for silky smooth button jumps
  const smoothRotation = useSpring(rotation, {
    stiffness: 75,
    damping: 24,
    mass: 0.8
  })

  // Interaction State
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const isDragging = useRef(false)
  const dragDistanceRef = useRef(0)
  const velocityRef = useRef(0)
  const lastInteractionTime = useRef(Date.now())
  const spinDirectionRef = useRef<-1 | 1>(-1) // -1 rotates forward/counter-clockwise

  // Respect prefers-reduced-motion
  const prefersReducedMotion = useReducedMotion()

  // Track active front index for indicators
  const [activeFrontIndex, setActiveFrontIndex] = useState(0)

  // Constant speed calculation: 360 deg / spinDuration seconds = deg per millisecond
  const baseSpeedDegPerMs = 360 / (spinDuration * 1000)

  // 1. Continuous Auto-Spin Engine via requestAnimationFrame with delta-time
  useEffect(() => {
    let animationFrameId: number
    let lastTimestamp = performance.now()

    const loop = (timestamp: number) => {
      const deltaMs = Math.min(timestamp - lastTimestamp, 64) // cap delta to avoid tab-switch jumps
      lastTimestamp = timestamp

      const now = Date.now()
      const timeSinceInteract = (now - lastInteractionTime.current) / 1000

      // Only auto-rotate if not dragging, not hovered/focused, not reduced motion, and after resume delay
      if (
        !prefersReducedMotion &&
        !isDragging.current &&
        !isHovered &&
        !isFocused &&
        timeSinceInteract >= resumeDelay
      ) {
        // Ease-in velocity smoothly from 0 to 1 over 1.2s after resume delay
        const resumeProgress = Math.min(1, (timeSinceInteract - resumeDelay) / 1.2)
        const currentSpeed = baseSpeedDegPerMs * resumeProgress

        const currentRot = rotation.get()
        const newRot = currentRot + spinDirectionRef.current * currentSpeed * deltaMs
        rotation.set(newRot)
      } else if (
        !isDragging.current &&
        Math.abs(velocityRef.current) > 0.005
      ) {
        // Apply inertia decay upon release
        const currentRot = rotation.get()
        rotation.set(currentRot + velocityRef.current * (deltaMs / 16.67))
        velocityRef.current *= 0.92 // friction factor
        if (Math.abs(velocityRef.current) <= 0.005) {
          velocityRef.current = 0
        }
      }

      // Update front-facing active index
      const curAngle = rotation.get()
      const normalizedAngle = ((-curAngle % 360) + 360) % 360
      const frontIdx = Math.round(normalizedAngle / anglePerItem) % count
      setActiveFrontIndex(frontIdx % (items.length || 1))

      animationFrameId = requestAnimationFrame(loop)
    }

    animationFrameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animationFrameId)
  }, [
    baseSpeedDegPerMs,
    resumeDelay,
    prefersReducedMotion,
    isHovered,
    isFocused,
    rotation,
    anglePerItem,
    count,
    items.length
  ])

  // Drag Handlers using Pointer Events to avoid unwanted translation & wild offsets
  const pointerStartPos = useRef<{ x: number; y: number; id: number } | null>(null)
  const isPointerDownRef = useRef(false)

  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true
    isDragging.current = false
    dragDistanceRef.current = 0
    velocityRef.current = 0
    lastInteractionTime.current = Date.now()
    pointerStartPos.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return
    const deltaX = e.movementX
    const totalMove = Math.hypot(
      e.clientX - (pointerStartPos.current?.x ?? e.clientX),
      e.clientY - (pointerStartPos.current?.y ?? e.clientY)
    )
    dragDistanceRef.current = Math.max(dragDistanceRef.current + Math.abs(deltaX), totalMove)

    // Only engage drag and capture pointer if the pointer has actually moved past jitter threshold (5px)
    if (dragDistanceRef.current > 5) {
      if (!isDragging.current) {
        isDragging.current = true
        try {
          ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        } catch {
          // ignore
        }
      }

      // Sensitivity factor for wheel rotation
      const sensitivity = isMobile ? 0.35 : 0.28
      const angleDelta = deltaX * sensitivity

      rotation.set(rotation.get() + angleDelta)
      velocityRef.current = angleDelta * 0.7

      if (deltaX !== 0) {
        spinDirectionRef.current = deltaX > 0 ? 1 : -1
      }
    }

    lastInteractionTime.current = Date.now()
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    const wasDragging = isDragging.current || dragDistanceRef.current > 5
    isPointerDownRef.current = false
    isDragging.current = false
    lastInteractionTime.current = Date.now()

    if (e.currentTarget && e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {
      try {
        ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {
        // ignore
      }
    }

    // Reset pointer start pos after a slight tick
    setTimeout(() => {
      dragDistanceRef.current = 0
      pointerStartPos.current = null
    }, 50)
  }

  // Prev / Next Step Rotations
  const rotateStep = useCallback(
    (direction: -1 | 1) => {
      lastInteractionTime.current = Date.now()
      velocityRef.current = 0
      spinDirectionRef.current = direction

      const currentRot = rotation.get()
      const target = Math.round((currentRot + direction * anglePerItem) / anglePerItem) * anglePerItem
      rotation.set(target)
    },
    [anglePerItem, rotation]
  )

  const handleNext = () => rotateStep(-1)
  const handlePrev = () => rotateStep(1)

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      handleNext()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      handlePrev()
    }
  }

  // Jump to specific index from dot indicator
  const handleDotClick = (idx: number) => {
    lastInteractionTime.current = Date.now()
    velocityRef.current = 0
    const targetAngle = -idx * anglePerItem
    rotation.set(targetAngle)
  }

  return (
    <div
      className={`c2c-3d-carousel-root relative w-full flex flex-col items-center select-none ${className}`}
      style={{
        perspective: '1200px',
        overflow: 'hidden',
        padding: '24px 0 12px 0'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Interactive 3D navigation cylinder"
    >
      {/* Cylinder Scene Viewport */}
      <div
        className="cylinder-viewport relative w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{
          height: `${cardHeight + (isMobile ? 80 : 110)}px`,
          perspective: '1200px',
          touchAction: 'pan-y'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* 3D Cylinder Wheel Container */}
        <motion.div
          className="cylinder-drum relative flex items-center justify-center"
          style={{
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            transformStyle: 'preserve-3d',
            rotateY: smoothRotation
          }}
        >
          {effectiveItems.map((item, idx) => {
            const itemAngle = idx * anglePerItem
            const originalIndex = idx % items.length
            const isFrontCard = originalIndex === activeFrontIndex

            return (
              <div
                key={`${item.id}-${idx}`}
                className="cylinder-face absolute inset-0"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  zIndex: isFrontCard ? 10 : 1
                }}
              >
                {/* Outward facing Card */}
                <button
                  type="button"
                  id={`carousel-card-${item.id}`}
                  onClick={(e) => {
                    // Suppress click only if user was actively dragging
                    if (dragDistanceRef.current > 5) {
                      e.preventDefault()
                      e.stopPropagation()
                      return
                    }
                    if (item.onClick) {
                      item.onClick()
                    } else if (onItemClick) {
                      onItemClick(item)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      if (item.onClick) {
                        item.onClick()
                      } else if (onItemClick) {
                        onItemClick(item)
                      }
                    }
                  }}
                  className={`group w-full h-full text-left rounded-2xl transition-all duration-200 outline-none flex flex-col justify-between cursor-pointer ${
                    isFrontCard
                      ? 'bg-white border-2 border-slate-900 shadow-xl'
                      : 'bg-white/95 border border-slate-200 hover:border-slate-800 shadow-md hover:shadow-lg'
                  }`}
                  style={{
                    padding: isMobile ? '16px' : '20px',
                    boxShadow: isFrontCard
                      ? '0 12px 28px -6px rgba(15, 23, 42, 0.16), 0 0 0 1px #0F172A'
                      : '0 4px 14px -2px rgba(15, 23, 42, 0.08)',
                    pointerEvents: 'auto'
                  }}
                  aria-label={`Navigate to ${item.label}`}
                >
                  {/* Card Header: Icon & Badge */}
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-150">
                      {item.icon}
                    </div>

                    {item.badge && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Card Center: Title & Count */}
                  <div className="mt-2 flex-1">
                    <div className="text-[15px] sm:text-[16px] font-extrabold text-slate-900 tracking-tight leading-snug line-clamp-1 font-['Outfit']">
                      {item.label}
                    </div>
                    {item.countLabel && (
                      <div className="text-[12px] font-semibold text-slate-500 mt-0.5 line-clamp-1">
                        {item.countLabel}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Action Link */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px] font-bold text-slate-900">
                    <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                      Open View
                    </span>
                    <span className="text-slate-400 group-hover:text-slate-900 transition-colors">
                      &rarr;
                    </span>
                  </div>
                </button>
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* Controls: Prev/Next Buttons & Dots */}
      <div className="flex items-center justify-center gap-4 mt-2 z-10">
        <button
          type="button"
          onClick={handlePrev}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-900 hover:text-white hover:border-slate-900 text-slate-800 flex items-center justify-center shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          aria-label="Previous card in wheel"
          title="Previous (Left Arrow)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Indicator Dots */}
        <div className="flex items-center gap-1.5 px-2">
          {items.map((it, idx) => (
            <button
              key={it.id}
              type="button"
              onClick={() => handleDotClick(idx)}
              className="h-1.5 rounded-full transition-all duration-200 border-none p-0 cursor-pointer"
              style={{
                width: activeFrontIndex === idx ? '22px' : '6px',
                backgroundColor: activeFrontIndex === idx ? '#0F172A' : '#CBD5E1'
              }}
              aria-label={`Rotate wheel to ${it.label}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-900 hover:text-white hover:border-slate-900 text-slate-800 flex items-center justify-center shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          aria-label="Next card in wheel"
          title="Next (Right Arrow)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
export default ThreeDCarousel
