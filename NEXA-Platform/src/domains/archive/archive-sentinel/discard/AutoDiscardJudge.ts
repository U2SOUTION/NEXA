import { SentinelContext } from '../core/SentinelContext'

export class AutoDiscardJudge {
  judge(_context: SentinelContext): boolean {
    void _context
    return false
  }
}
