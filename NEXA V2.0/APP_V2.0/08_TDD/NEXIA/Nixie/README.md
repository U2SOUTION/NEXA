# 08_TDD / NEXIA / Nixie (NIXIE · ML1 Presence Shell)

**NIXIE(닉시)** 의 **4 Shell 채널** 전용 TDD. 공통 정의·경계는 [`TDD-070` §3.6.1~3.6.2](../../../용어집_NEXA전용_v2.0.md) · [`TDD-045` §5~6](../../Knowledge/08_TDD_Knowledge_디렉토리책임및기획자원경로.md).

|   doc_id    | 문서                                                        | 채널                             |
| :---------: | :---------------------------------------------------------- | :------------------------------- |
| **TDD-061** | [Web Shell v1.0](./08_TDD_NIXIE_WebShell_v1.0.md)           | 브라우저 레이어 · Embedded ↔ PiP |
| **TDD-062** | [Desktop Shell v1.0](./08_TDD_NIXIE_DesktopShell_v1.0.md)   | Python PC 독립 얼굴              |
| **TDD-063** | [Mobile Shell v1.0](./08_TDD_NIXIE_MobileShell_v1.0.md)     | iOS/Android 앱                   |
| **TDD-064** | [Physical Shell v1.0](./08_TDD_NIXIE_PhysicalShell_v1.0.md) | ESP32 · Raspberry Pi 실물        |

**공통 계약:** `channel_id` · Envelope · Reflex triage · Express — Run·Event Router·MQTT publish **✗**.

**플랫폼 UI 3층:** **NEXU Canvas**(데이터 페브릭) · **BAX**(레이아웃) · **NIXIE**(전방 Express, Canvas·BAX **포함**) — [`TDD-070` §3.6.3](../../../용어집_NEXA전용_v2.0.md).
