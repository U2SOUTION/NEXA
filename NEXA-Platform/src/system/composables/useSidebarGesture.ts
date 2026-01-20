import { onMounted, onUnmounted } from 'vue'

export function useSidebarGesture({
  openLeft,
  closeLeft,
  openRight,
  closeRight,
}) {
  const EDGE = 24
  const SWIPE_DISTANCE = 60
  const SWIPE_TIME = 250
  const COOLDOWN = 400

  let lastTrigger = 0

  // ---------------------------
  // PC (Mouse)
  // ---------------------------
  const mouseHistory: { x: number; t: number }[] = []

  function onMouseMove(e: MouseEvent) {
    if (e.buttons !== 0) return

    const now = performance.now()
    mouseHistory.push({ x: e.clientX, t: now })
    if (mouseHistory.length > 5) mouseHistory.shift()

    if (mouseHistory.length < 2) return

    const first = mouseHistory[0]
    const last = mouseHistory[mouseHistory.length - 1]

    const dx = last.x - first.x
    const dt = last.t - first.t
    if (dt > 200) return

    if (Math.abs(dx) < 80) return

    if (!canTrigger()) return

    // Left Edge
    if (first.x < EDGE) {
      dx > 0 ? openLeft() : closeLeft()
      resetMouse()
    }

    // Right Edge
    if (first.x > window.innerWidth - EDGE) {
      dx < 0 ? openRight() : closeRight()
      resetMouse()
    }
  }

  function resetMouse() {
    mouseHistory.length = 0
  }

  // ---------------------------
  // Mobile (Touch)
  // ---------------------------
  let touchStartX = 0
  let touchStartTime = 0

  function onTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    touchStartX = touch.clientX
    touchStartTime = performance.now()
  }

  function onTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartX
    const dt = performance.now() - touchStartTime

    if (Math.abs(dx) < SWIPE_DISTANCE) return
    if (dt > SWIPE_TIME) return
    if (!canTrigger()) return

    // Left Edge
    if (touchStartX < EDGE) {
      dx > 0 ? openLeft() : closeLeft()
    }

    // Right Edge
    if (touchStartX > window.innerWidth - EDGE) {
      dx < 0 ? openRight() : closeRight()
    }
  }

  // ---------------------------
  // Cooldown
  // ---------------------------
  function canTrigger() {
    const now = performance.now()
    if (now - lastTrigger < COOLDOWN) return false
    lastTrigger = now
    return true
  }

  // ---------------------------
  // Lifecycle
  // ---------------------------
  onMounted(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchend', onTouchEnd)
  })
}
