type PatientMessageProps = {
  message: string;
};

export function PatientMessage({ message }: PatientMessageProps) {
  return (
    <section className="section-block message-section">
      <div className="section-heading">
        <h2>先生からのメッセージ</h2>
        <p>診察のなかで共有する、次の一歩への言葉です。</p>
      </div>
      <blockquote className="doctor-message">
        <p>{message}</p>
      </blockquote>
    </section>
  );
}
