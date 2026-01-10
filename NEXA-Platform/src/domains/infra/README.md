# domains/infra/README.md

## 통신 규칙

- ❌ 금지: import { erpStore } from '@/domains/erp'
- ✅ 허용: const { notify } = useSystemComm()
- 통신은 system/composables 경유

### 2. **Cursor에게 규칙을 가르치기**

`.cursorrules` 파일 또는 프로젝트 설명에:

```
NEXA 플랫폼 규칙:
1. 도메인 간 직접 import 금지
2. 통신은 system/composables 경유
3. 새 파일 생성 시 위치 먼저 확인
4.
```
