import { shallowRef } from 'vue'

/**
 * 우측 넥셋 Teleport 대상 DOM.
 * `onBeforeUnmount`에서 먼저 `null`로 비워야 Teleport가 제거된 부모에 붙지 않는다.
 */
export const nexionMinimapHostEl = shallowRef<HTMLElement | null>(null)
export const nexionControlsHostEl = shallowRef<HTMLElement | null>(null)

export function setNexionMinimapHost(el: HTMLElement | null) {
  nexionMinimapHostEl.value = el
}

export function setNexionControlsHost(el: HTMLElement | null) {
  nexionControlsHostEl.value = el
}
