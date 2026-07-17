import type { CSSProperties } from 'react';

/**
 * React 19 hydration: 버튼에 CSS `user-select`만 쓰면 클라이언트가
 * `style="user-select:auto"`를 붙여 SSR과 불일치할 수 있음.
 * 인라인으로 명시해 서버·클라이언트 출력을 맞춘다.
 */
export function touchStyle(extra?: CSSProperties): CSSProperties {
  return { userSelect: 'none', ...extra };
}
