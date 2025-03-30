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
(function() {
  const SWIPE_THRESHOLD = 50; // Minimum horizontal distance in pixels to trigger a swipe
  let startX = 0, startY = 0, pointerId = null;

  function setupSwipe() {
    // Attach events to the document so we catch pointer events anywhere in the deck
    document.addEventListener('pointerdown', (e) => {
      // Only process touch or mouse pointers (skip pen, etc.)
      if (e.pointerType === 'touch' || e.pointerType === 'mouse') {
        pointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
      }
    });

    document.addEventListener('pointerup', (e) => {
      if (e.pointerId !== pointerId) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      // Check if the horizontal swipe is dominant and over the threshold
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX > 0) {
          console.log('Swipe right detected');
          window.bespoke && window.bespoke.prev && window.bespoke.prev();
        } else {
          console.log('Swipe left detected');
          window.bespoke && window.bespoke.next && window.bespoke.next();
        }
      }
      pointerId = null;
    });
  }

  // Wait until the entire window (including Bespoke initialization) is loaded
  window.addEventListener('load', setupSwipe);
})();
</script>
