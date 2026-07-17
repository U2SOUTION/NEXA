import { NextResponse } from 'next/server';

/** Phase 1 — session REST stub [03 GET /api/session] */
export async function GET() {
  return NextResponse.json({
    work_session: 'machining',
    gcode_executor_state: 'IDLE',
    run_mode: 'ui_sim',
    note: 'Live state via WebSocket /ui/ws',
  });
}
