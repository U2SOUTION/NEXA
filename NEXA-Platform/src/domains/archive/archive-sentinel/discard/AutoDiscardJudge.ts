import { SentinelContext } from '../core/SentinelContext'

export class AutoDiscardJudge {
  judge(context: SentinelContext): boolean {
    return false
  }
}
