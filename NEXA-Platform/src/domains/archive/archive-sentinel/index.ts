import { EventDispatcher } from './events/EventDispatcher'
import { WritingSentinel } from './judgment/WritingSentinel'
import { AutoClassifier } from './classification/AutoClassifier'
import { AutoDiscardJudge } from './discard/AutoDiscardJudge'
import { TemporalAnalyzer } from './flow/TemporalAnalyzer'

export class ArchiveSentinel {
  constructor() {}

  initialize() {
    EventDispatcher.register([WritingSentinel, AutoClassifier, AutoDiscardJudge, TemporalAnalyzer])
  }
}
