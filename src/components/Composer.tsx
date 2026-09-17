import { useState, type FormEvent, type KeyboardEvent } from "react";
import { SAMPLES } from "../data/samples";
import type { ExpiryKind, ContractDraft } from "../types";

interface ComposerProps {
  draft: ContractDraft;
  sampleId: string | null;
  onChange: (next: ContractDraft) => void;
  onSample: (id: string) => void;
  onAddSuccess: (raw: string) => boolean;
  onRemoveSuccess: (raw: string) => void;
  onAddStop: (raw: string) => boolean;
  onRemoveStop: (raw: string) => void;
}

export function Composer({
  draft,
  sampleId,
  onChange,
  onSample,
  onAddSuccess,
  onRemoveSuccess,
  onAddStop,
  onRemoveStop,
}: ComposerProps) {
  const [successLine, setSuccessLine] = useState("");
  const [stopLine, setStopLine] = useState("");

  const patch = (partial: Partial<ContractDraft>) => {
    onChange({ ...draft, ...partial });
  };

  const submitSuccess = (event?: FormEvent) => {
    event?.preventDefault();
    if (onAddSuccess(successLine)) setSuccessLine("");
  };

  const submitStop = (event?: FormEvent) => {
    event?.preventDefault();
    if (onAddStop(stopLine)) setStopLine("");
  };

  const onSuccessKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitSuccess();
    }
  };

  const onStopKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitStop();
    }
  };

  return (
    <section className="composer">
      <div className="composer-head">
        <h2>Write the agreement</h2>
        <p>Pick a sample or name both parties, then list success and stop conditions.</p>
      </div>

      <div className="sample-row" role="list">
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            role="listitem"
            className={sampleId === sample.id ? "chip is-on" : "chip"}
            onClick={() => onSample(sample.id)}
          >
            <span className="chip-top">
              <i className="dot is-go" aria-hidden="true" />
              {sample.label}
            </span>
            <small>{sample.blurb}</small>
          </button>
        ))}
      </div>

      <label className="editor-label" htmlFor="title-input">
        Title
      </label>
      <input
        id="title-input"
        value={draft.title}
        onChange={(event) => patch({ title: event.target.value })}
        placeholder="PR review session"
        autoComplete="off"
      />

      <div className="party-inputs">
        <div>
          <label className="editor-label" htmlFor="human-input">
            Human
          </label>
          <input
            id="human-input"
            value={draft.human}
            onChange={(event) => patch({ human: event.target.value })}
            placeholder="Staff engineer"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="editor-label" htmlFor="agent-input">
            Agent
          </label>
          <input
            id="agent-input"
            value={draft.agent}
            onChange={(event) => patch({ agent: event.target.value })}
            placeholder="Review bot"
            autoComplete="off"
          />
        </div>
      </div>

      <label className="editor-label" htmlFor="goal-input">
        Goal
      </label>
      <textarea
        id="goal-input"
        rows={2}
        value={draft.goal}
        onChange={(event) => patch({ goal: event.target.value })}
        placeholder="What this session is for"
      />

      <p className="editor-label" id="success-label">
        Success criteria
      </p>
      {draft.success.length ? (
        <ul className="picked is-block">
          {draft.success.map((line) => (
            <li key={line}>
              <span>{line}</span>
              <button type="button" onClick={() => onRemoveSuccess(line)} aria-label={`Remove ${line}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="field-hint">Done-when bullets. One line each.</p>
      )}
      <form className="add-row" onSubmit={submitSuccess}>
        <input
          value={successLine}
          onChange={(event) => setSuccessLine(event.target.value)}
          onKeyDown={onSuccessKey}
          placeholder="e.g. Tests pass and a PR is open"
          aria-labelledby="success-label"
          autoComplete="off"
        />
        <button type="submit" className="btn btn-inline">
          Add
        </button>
      </form>

      <p className="editor-label" id="stop-label">
        Stop / must not
      </p>
      {draft.stop.length ? (
        <ul className="picked is-block is-deny">
          {draft.stop.map((line) => (
            <li key={line}>
              <span>{line}</span>
              <button type="button" onClick={() => onRemoveStop(line)} aria-label={`Remove ${line}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="field-hint">Hard stops. Pair with Refuse Card if you need a stamp.</p>
      )}
      <form className="add-row" onSubmit={submitStop}>
        <input
          value={stopLine}
          onChange={(event) => setStopLine(event.target.value)}
          onKeyDown={onStopKey}
          placeholder="e.g. Do not merge to main"
          aria-labelledby="stop-label"
          autoComplete="off"
        />
        <button type="submit" className="btn btn-inline">
          Add
        </button>
      </form>

      <label className="editor-label" htmlFor="scope-input">
        Scope <span className="opt">(optional)</span>
      </label>
      <input
        id="scope-input"
        value={draft.scope}
        onChange={(event) => patch({ scope: event.target.value })}
        placeholder="This pull request only"
        autoComplete="off"
      />

      <p className="editor-label" id="expiry-label">
        Session / expiry
      </p>
      <div
        className={draft.expiryKind === "date" ? "expiry-row has-date" : "expiry-row"}
        role="group"
        aria-labelledby="expiry-label"
      >
        <button
          type="button"
          className={draft.expiryKind === "session" ? "seg is-on" : "seg"}
          onClick={() => patch({ expiryKind: "session" as ExpiryKind })}
        >
          Session
        </button>
        <button
          type="button"
          className={draft.expiryKind === "date" ? "seg is-on" : "seg"}
          onClick={() => patch({ expiryKind: "date" as ExpiryKind })}
        >
          Date
        </button>
        {draft.expiryKind === "date" ? (
          <input
            type="date"
            aria-label="Expiry date"
            value={draft.expiryDate}
            onChange={(event) =>
              patch({ expiryKind: "date", expiryDate: event.target.value })
            }
          />
        ) : null}
      </div>

      <p className="disclaimer">
        Not a legal contract and not an enforcement runtime. A shareable card
        is a lab artifact for communication. Pair with{" "}
        <a href="https://github.com/smfworks/tool-permit" rel="noreferrer" target="_blank">
          Tool Permit
        </a>{" "}
        for the GO-list and{" "}
        <a href="https://github.com/smfworks/refuse-card" rel="noreferrer" target="_blank">
          Refuse Card
        </a>{" "}
        for the NO / HOLD twin. Judgment stays human.
      </p>
    </section>
  );
}
