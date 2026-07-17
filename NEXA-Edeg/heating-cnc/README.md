# Heating CNC — ESP32 Edge Firmware (Phase 2 scaffold)

PlatformIO 프로젝트 골격. FluidNC fork + Tri-Link WSS 클라이언트는 Phase 2.1–2.4에서 구현.

## 목표

- 4축 FluidNC (`turning-4axis.yaml`)
- WSS Inbound: `heartbeat`, `cmd_jog`, `cmd_run` chunk
- Tri-Link Fail-safe: 3s 단절 → M5 · 모션 정지 · M211
- `device_dry`: PWM OFF, 모션만
- StallGuard scan pass → `scan_pass_sample` / `scan_pass_result`

## 로컬 개발 (Node device-sim 대체)

실장비 없이 Device leg 검증:

```bash
cd NEXA-Platform
npm run dev:heating-cnc-worker
npm run device:sim -w heating-cnc-mvp
```

## 빌드 (펌웨어 착수 후)

```bash
cd NEXA-Edeg/heating-cnc
pio run -e esp32-s3
```

## 관련 문서

- `NEXA V2.0/Heating_CNC/01-Hardware-Motion.md`
- `NEXA V2.0/Heating_CNC/03-Software-Protocol.md`
- `NEXA-Platform/packages/heating-cnc/src/protocol/schemas/`
