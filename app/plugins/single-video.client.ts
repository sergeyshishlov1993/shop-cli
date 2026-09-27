// Одночасно грає лише одне відео з плеєром: запуск нового ставить на паузу попереднє.
// Фонові/hover-відео без controls (картка товару, фон сторінки) не чіпаємо.
export default defineNuxtPlugin(() => {
  document.addEventListener('play', (event) => {
    const current = event.target
    if (!(current instanceof HTMLVideoElement) || !current.controls) return
    document.querySelectorAll('video').forEach(video => video !== current && video.controls && !video.paused && video.pause())
  }, true)
})
