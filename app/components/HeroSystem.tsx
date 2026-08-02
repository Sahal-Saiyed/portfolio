const pipeline = ["Data", "Retrieve", "Reason", "Validate", "Ship"];

export function HeroSystem() {
  return (
    <div className="hero-system" aria-label="Applied AI system pipeline">
      <div className="hero-system__topline">
        <span>APPLIED_AI.SYSTEM</span>
        <span className="system-live">
          <span aria-hidden="true" /> LIVE
        </span>
      </div>
      <div className="hero-system__canvas">
        <div className="pipeline">
          {pipeline.map((step, index) => (
            <div className={`pipeline__step pipeline__step--${index + 1}`} key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
        <div className="pipeline__tags" aria-label="System qualities">
          <span>Grounded systems</span>
          <span>Human-validated</span>
          <span>Product-minded</span>
        </div>
      </div>
    </div>
  );
}
