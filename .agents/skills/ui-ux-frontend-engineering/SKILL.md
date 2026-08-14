---
name: ui-ux-frontend-engineering
description: >-
  Use this skill when developing the HTML/CSS/JS frontend, designing typing feedback, or implementing micro-animations.
---

# UI/UX Frontend Engineering Runbook

## 1. Visual Excellence
- Use vibrant colors, sleek dark modes, and modern typography (e.g., Inter, Roboto).
- Add subtle micro-animations (glassmorphism, smooth gradients) to make the typing experience feel alive.
- DO NOT use frameworks like React or Tailwind unless explicitly approved; use Vanilla HTML/CSS/JS.

## 2. Typing Engine Performance
- The keydown listener must execute in < 1ms to prevent input lag.
- Use `requestAnimationFrame` for UI updates (WPM/accuracy counters).
- Do not perform heavy string matching synchronously on every keypress if it drops frames.

## 3. Pywebview Communication
- Use the `window.pywebview.api` object to send session payloads to Python.
- Provide clear loading states in the UI when waiting for the Agent Pipeline to generate the next exercise.
