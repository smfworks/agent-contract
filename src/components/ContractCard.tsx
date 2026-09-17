import type { AgentContract } from "../types";
import { expiryLabel, formatExpiry } from "../lib/contract";
import { formatStampTime } from "../lib/share";

interface ContractCardProps {
  contract: AgentContract | null;
}

function barcodeBars(id: string): number[] {
  const bars: number[] = [];
  for (let i = 0; i < 36; i += 1) {
    const code = id.charCodeAt(i % id.length) + i * 17;
    bars.push(1 + (code % 4));
  }
  return bars;
}

export function ContractCard({ contract }: ContractCardProps) {
  const ready = Boolean(
    contract?.title &&
      contract.human &&
      contract.agent &&
      contract.goal &&
      contract.success.length &&
      contract.stop.length,
  );
  const tone = ready ? "is-go" : "is-empty";

  return (
    <article className={`ticket ${tone}`}>
      <div className="ticket-rail" aria-hidden="true" />
      <header className="ticket-head">
        <div>
          <p className="r-kicker">Human↔agent agreement</p>
          <h2>Contract</h2>
        </div>
        <p className="ticket-seq">{contract?.id ?? "AC-————"}</p>
      </header>

      <div className="perf" aria-hidden="true">
        <span />
      </div>

      <div className="ticket-body">
        <div className="stamp-row">
          <div className={`wax ${tone}`}>
            <div className="wax-ring" />
            <div className="wax-core">
              <span className="wax-kicker">SMF WORKS</span>
              <strong>{ready ? "BOUND" : "DRAFT"}</strong>
              <span className="wax-sub">{ready ? "AGREEMENT" : "FILL PARTIES"}</span>
            </div>
          </div>
          <dl className="codes">
            <div>
              <dt>Stamp</dt>
              <dd>{ready ? "CONTRACT" : "—"}</dd>
            </div>
            <div>
              <dt>Expiry</dt>
              <dd>{contract ? formatExpiry(contract.expiry) : "—"}</dd>
            </div>
            <div>
              <dt>Parties</dt>
              <dd>H ↔ A</dd>
            </div>
          </dl>
        </div>

        <section className="r-hero">
          <p className="r-label">Title</p>
          <h3>{contract?.title || "Name the agreement."}</h3>
        </section>

        <dl className="parties">
          <div className="party">
            <dt>Human</dt>
            <dd>{contract?.human || "Who owns judgment."}</dd>
          </div>
          <div className="party">
            <dt>Agent</dt>
            <dd>{contract?.agent || "Who does the work."}</dd>
          </div>
        </dl>

        <section className="r-block">
          <p className="r-label">Goal</p>
          <p className={contract?.goal ? "scope-line" : "r-placeholder"}>
            {contract?.goal || "One line: what this session is for."}
          </p>
        </section>

        <section className="r-block">
          <p className="r-label">Success</p>
          {contract && contract.success.length ? (
            <ol className="clauses">
              {contract.success.map((line, index) => (
                <li key={line}>
                  <span className="n">{index + 1}</span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="r-placeholder">Done-when bullets go here.</p>
          )}
        </section>

        <section className="r-block">
          <p className="r-label is-deny">Stop / must not</p>
          {contract && contract.stop.length ? (
            <ol className="clauses is-stop">
              {contract.stop.map((line, index) => (
                <li key={line}>
                  <span className="n">{index + 1}</span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="r-placeholder">Hard stops go here.</p>
          )}
        </section>

        {contract?.scope ? (
          <section className="r-block">
            <p className="r-label">Scope</p>
            <p className="scope-line">{contract.scope}</p>
          </section>
        ) : null}

        <section className="coupon">
          <p className="r-label">Window</p>
          <p className="coupon-line">
            {contract ? expiryLabel(contract.expiry) : "Session or a calendar date."}
          </p>
        </section>
      </div>

      <div className="perf" aria-hidden="true">
        <span />
      </div>

      <div className="barcode" aria-hidden="true">
        {barcodeBars(contract?.id ?? "AC-0000").map((width, index) => (
          <i key={index} style={{ width }} />
        ))}
      </div>

      <footer className="r-foot">
        <p>SMF Works · Agent Contract</p>
        <p className="r-link">smfworks.com</p>
        <p className="r-motto">
          {contract ? formatStampTime(contract.issuedAt) : "Lab artifact · not a contract in law"}
        </p>
        <p className="r-motto">Not legal advice. Not enforcement.</p>
      </footer>
    </article>
  );
}
