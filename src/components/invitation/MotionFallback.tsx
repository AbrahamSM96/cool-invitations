'use client'

import { type ReactNode, useEffect } from 'react'

/** Elements animated on entry (the scroll-only effects are left out). */
const TARGETS = '.inv-reveal, .inv-stagger > *, .inv-photo'

/**
 * Entrance animations for browsers without scroll-driven animations
 * (Firefox, iOS before 26). Marks elements with `data-inview` as they enter
 * the card, and `globals.css` turns that into transitions. Does nothing
 * where CSS already handles it, with "reduce motion", or for `none`. If
 * this never runs, nothing is hidden: the hiding styles need the
 * `inv-motion-js` class it adds.
 */
export function MotionFallback(): ReactNode {
  useEffect(() => {
    if (CSS.supports('animation-timeline: view()')) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const stage = document.querySelector<HTMLElement>('[data-invitation-theme]')
    const scroller = stage?.querySelector('main')
    if (!stage || !scroller || stage.dataset.motion === 'none') return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          ;(entry.target as HTMLElement).dataset.inview = ''
          observer.unobserve(entry.target)
        }
      },
      { root: scroller, rootMargin: '0px 0px -12% 0px', threshold: 0.1 }
    )
    const targets = stage.querySelectorAll(TARGETS)
    // Whatever is already on screen shows at once, without a flash.
    for (const target of targets) {
      const box = target.getBoundingClientRect()
      const view = scroller.getBoundingClientRect()
      if (box.top < view.bottom && box.bottom > view.top) {
        ;(target as HTMLElement).dataset.inview = ''
      } else observer.observe(target)
    }
    stage.classList.add('inv-motion-js')
    return (): void => observer.disconnect()
  }, [])
  return null
}
