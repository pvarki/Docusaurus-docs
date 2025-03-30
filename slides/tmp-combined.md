---
marp: true
title: Deploy App Slides
paginate: true
backgroundColor: #1e1e1e
---
<!-- _class: lead -->

# Deploy App

Simple slides about Deploy App.

---

# Slide 2

Some bullet points here

---

# Slide 3

Image examples, etc.



<script>
(() => {
  // We'll wait until Marp (Bespoke) is fully initialized
  document.addEventListener('DOMContentLoaded', () => {
    let startX = 0
    let startY = 0
    const SWIPE_THRESHOLD = 50

    document.addEventListener('touchstart', (e) => {
      startX = e.changedTouches[0].screenX
      startY = e.changedTouches[0].screenY
    })

    document.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].screenX
      const endY = e.changedTouches[0].screenY
      const deltaX = endX - startX
      const deltaY = endY - startY

      // If horizontal swipe > threshold, call next/prev
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX > 0) window.bespoke?.prev()
        else window.bespoke?.next()
      }
    })
  })
})()
</script>
