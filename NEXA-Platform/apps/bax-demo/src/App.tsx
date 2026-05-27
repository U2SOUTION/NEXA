import { VirtualCanvas } from './canvas/VirtualCanvas'
import { DevController } from './dev/DevController'

export function App() {
  return (
    <div className="bax-app">
      <header className="bax-header">
        <h1>BAX Demo</h1>
        <p>다중 타이포·그래프 관제 보드 — MAE LayoutPolicy 시뮬레이션 · SSOT v0.9</p>
      </header>
      <main className="bax-main">
        <VirtualCanvas />
        <DevController />
      </main>
    </div>
  )
}
