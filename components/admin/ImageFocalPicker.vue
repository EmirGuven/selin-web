<template>
  <div class="focal">
    <div class="focal__col">
      <p class="focal__label">Fotoğrafa tıkla / sürükle — odak noktasını belirle</p>
      <div
        ref="stageRef"
        class="focal__stage"
        @pointerdown="onPointerDown"
      >
        <img :src="imageUrl" alt="" draggable="false" />
        <div class="focal__marker" :style="{ left: x + '%', top: y + '%' }"></div>
      </div>
    </div>

    <div class="focal__col">
      <p class="focal__label">Mobil önizleme (16:9 kırpma)</p>
      <div class="focal__preview">
        <img :src="imageUrl" :style="{ objectPosition: `${x}% ${y}%` }" alt="" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  imageUrl: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const stageRef = ref<HTMLElement | null>(null)
const x = ref(50)
const y = ref(50)

function parsePosition(val: string) {
  const v = String(val || '').trim()
  if (!v || v === 'center') return { x: 50, y: 50 }
  if (v === 'center top') return { x: 50, y: 0 }
  if (v === 'center bottom') return { x: 50, y: 100 }

  const match = v.match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/)
  if (match) {
    return {
      x: Math.min(100, Math.max(0, parseFloat(match[1]))),
      y: Math.min(100, Math.max(0, parseFloat(match[2]))),
    }
  }
  return { x: 50, y: 50 }
}

watch(
  () => props.modelValue,
  (val) => {
    const parsed = parsePosition(val)
    x.value = parsed.x
    y.value = parsed.y
  },
  { immediate: true }
)

function updateFromEvent(e: PointerEvent) {
  const el = stageRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const px = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
  const py = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))
  x.value = Math.round(px)
  y.value = Math.round(py)
  emit('update:modelValue', `${x.value}% ${y.value}%`)
}

function onPointerDown(e: PointerEvent) {
  updateFromEvent(e)
  const el = stageRef.value
  if (!el) return
  el.setPointerCapture(e.pointerId)

  function onMove(ev: PointerEvent) {
    updateFromEvent(ev)
  }
  function onUp(ev: PointerEvent) {
    el?.releasePointerCapture(ev.pointerId)
    el?.removeEventListener('pointermove', onMove)
    el?.removeEventListener('pointerup', onUp)
  }

  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerup', onUp)
}
</script>

<style scoped>
.focal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 640px) {
  .focal { grid-template-columns: 1fr; }
}

.focal__label {
  margin: 0 0 0.4rem;
  font-size: 0.82rem;
  color: #64748b;
}

.focal__stage {
  position: relative;
  display: inline-block;
  max-width: 100%;
  border-radius: 10px;
  overflow: hidden;
  cursor: crosshair;
  touch-action: none;
  border: 2px solid #e2e8f0;
  user-select: none;
  line-height: 0;
}

.focal__stage img {
  display: block;
  max-width: 100%;
  max-height: 420px;
  width: auto;
  height: auto;
  pointer-events: none;
}

.focal__marker {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: rgba(27, 79, 114, 0.85);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.focal__preview {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}

.focal__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
