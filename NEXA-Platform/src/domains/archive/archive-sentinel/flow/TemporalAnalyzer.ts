import { SentinelContext } from '../core/SentinelContext'

export class TemporalAnalyzer {
  analyze(_context: SentinelContext): 'now' | 'future' | 'archive' {
    void _context
    return 'now'
  }
}
