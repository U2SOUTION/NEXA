/**
 * NEXA 시스템 전역 이벤트 버스
 * - 도메인 간의 느슨한 결합(Loose Coupling)을 위한 이벤트 기반 통신 제공
 */
import { onBeforeUnmount } from 'vue'

type EventHandler = (data: any) => void

const bus = new Map<string, Set<EventHandler>>()

export function useEventBus() {
  /**
   * 이벤트 리스너 등록
   */
  function on(event: string, handler: EventHandler) {
    if (!bus.has(event)) {
      bus.set(event, new Set())
    }
    bus.get(event)?.add(handler)
  }

  /**
   * 이벤트 리스너 해제
   */
  function off(event: string, handler: EventHandler) {
    bus.get(event)?.delete(handler)
  }

  /**
   * 이벤트 발행
   */
  function emit(event: string, data?: any) {
    bus.get(event)?.forEach(handler => handler(data))
  }

  /**
   * 컴포넌트 생명주기에 맞춘 자동 정리 리스너
   */
  function useListener(event: string, handler: EventHandler) {
    on(event, handler)
    onBeforeUnmount(() => {
      off(event, handler)
    })
  }

  return {
    on,
    off,
    emit,
    useListener
  }
}
