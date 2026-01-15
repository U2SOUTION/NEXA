import { SentinelContext } from '../core/SentinelContext'

export class TemporalAnalyzer {
  analyze(context: SentinelContext): 'now' | 'future' | 'archive' {
    return 'now'
  }
}
