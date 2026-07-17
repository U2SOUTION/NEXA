interface EventLogProps {
  lines: string[];
}

export function EventLog({ lines }: EventLogProps) {
  return (
    <section className="card">
      <h2 className="card__title">이벤트</h2>
      <pre className="event-log">{lines.length ? lines.join('\n') : '이벤트 로그가 여기에 표시됩니다.'}</pre>
    </section>
  );
}
