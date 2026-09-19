import { SAMPLES } from "./data/samples";
import {
  addBullet,
  canExport,
  cloneDraft,
  contractToJson,
  removeBullet,
  serializeContract,
  slugify,
} from "./lib/contract";
import { cardToPngBlob, copyText, downloadBlob } from "./lib/exportImage";
import { EMPTY_DRAFT, type ContractDraft } from "./types";
import { Actions } from "./components/Actions";
import { Composer } from "./components/Composer";
import { ContractCard } from "./components/ContractCard";
import { Header } from "./components/Header";
import { SisterStrip } from "./components/SisterStrip";
import { HandoffBanner } from "./components/HandoffBanner";
import { Toast } from "./components/Toast";
import { formatCompactStats, formatShareText } from "./lib/share";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function initialFromUrl(): { draft: ContractDraft; sampleId: string | null } {
  const params = new URLSearchParams(window.location.search);
  const sample = params.get("sample");
  const found = SAMPLES.find((item) => item.id === sample);
  if (!found) return { draft: cloneDraft(), sampleId: null };
  return { draft: cloneDraft(found.draft), sampleId: found.id };
}

function applyShotClass(): void {
  const shot = new URLSearchParams(window.location.search).get("shot");
  if (shot === "card" || shot === "og") {
    document.body.classList.add(`shot-${shot}`);
  }
}

export default function App() {
  applyShotClass();
  const [draft, setDraft] = useState<ContractDraft>(() => initialFromUrl().draft);
  const [sampleId, setSampleId] = useState<string | null>(() => initialFromUrl().sampleId);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<"png" | "share" | "json" | null>(null);
  const [now] = useState(() => new Date());
  const frameRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);

  const loadSample = useCallback((id: string) => {
    const sample = SAMPLES.find((item) => item.id === id);
    if (!sample) return;
    setDraft(cloneDraft(sample.draft));
    setSampleId(id);
  }, []);

  const contract = useMemo(() => serializeContract(draft, now), [draft, now]);
  const exportable = canExport(contract);

  const reset = useCallback(() => {
    setDraft(cloneDraft(EMPTY_DRAFT));
    setSampleId(null);
    showToast("Cleared.");
  }, [showToast]);

  const withFrame = useCallback(async () => {
    const node = frameRef.current;
    if (!node || !exportable) throw new Error("Nothing to stamp yet.");
    node.classList.add("is-exporting");
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    try {
      return await cardToPngBlob(node);
    } finally {
      node.classList.remove("is-exporting");
    }
  }, [exportable]);

  const downloadPng = useCallback(async () => {
    if (!exportable) return;
    setBusy("png");
    try {
      const blob = await withFrame();
      downloadBlob(blob, `agent-contract-${slugify(contract.title)}.png`);
      showToast("PNG downloaded.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "PNG export failed.");
    } finally {
      setBusy(null);
    }
  }, [exportable, contract.title, showToast, withFrame]);

  const copyShare = useCallback(async () => {
    if (!exportable) return;
    setBusy("share");
    try {
      await copyText(formatShareText(contract));
      showToast("Share text copied.");
    } catch {
      showToast("Could not copy share text.");
    } finally {
      setBusy(null);
    }
  }, [exportable, contract, showToast]);

  const copyJson = useCallback(async () => {
    if (!exportable) return;
    setBusy("json");
    try {
      await copyText(contractToJson(contract));
      showToast("JSON copied.");
    } catch {
      showToast("Could not copy JSON.");
    } finally {
      setBusy(null);
    }
  }, [exportable, contract, showToast]);

  const onChange = useCallback((next: ContractDraft) => {
    setSampleId(null);
    setDraft(next);
  }, []);

  const onAddSuccess = useCallback(
    (raw: string) => {
      const next = addBullet(draft.success, raw);
      if (next.length === draft.success.length) return false;
      setSampleId(null);
      setDraft({ ...draft, success: next });
      return true;
    },
    [draft],
  );

  const onRemoveSuccess = useCallback(
    (raw: string) => {
      setSampleId(null);
      setDraft({ ...draft, success: removeBullet(draft.success, raw) });
    },
    [draft],
  );

  const onAddStop = useCallback(
    (raw: string) => {
      const next = addBullet(draft.stop, raw);
      if (next.length === draft.stop.length) return false;
      setSampleId(null);
      setDraft({ ...draft, stop: next });
      return true;
    },
    [draft],
  );

  const onRemoveStop = useCallback(
    (raw: string) => {
      setSampleId(null);
      setDraft({ ...draft, stop: removeBullet(draft.stop, raw) });
    },
    [draft],
  );

  const live = useMemo(() => {
    if (!exportable) return "Waiting for an agreement";
    return `${contract.title} · ${contract.human} ↔ ${contract.agent}`;
  }, [exportable, contract.title, contract.human, contract.agent]);

  const preview = contract.title || contract.human || contract.agent || contract.goal ||
    contract.success.length || contract.stop.length
    ? contract
    : null;

  return (
    <div className="page">
      <div className="ambient" aria-hidden="true" />
      <Header />
      <SisterStrip current="agent-contract" payload={JSON.stringify(draft)} />
      <main className="layout">
        <Composer
          draft={draft}
          sampleId={sampleId}
          onChange={onChange}
          onSample={loadSample}
          onAddSuccess={onAddSuccess}
          onRemoveSuccess={onRemoveSuccess}
          onAddStop={onAddStop}
          onRemoveStop={onRemoveStop}
        />
        <section className="stage" aria-label="Contract preview">
          <p className="sr-only" aria-live="polite">
            {live}
          </p>
          <div className="stage-scroll">
            <div ref={frameRef} className="export-frame">
              <ContractCard contract={preview} />
            </div>
          </div>
          {exportable ? <p className="stage-stats">{formatCompactStats(contract)}</p> : null}
          <Actions
            disabled={!exportable}
            busy={busy}
            onDownload={() => void downloadPng()}
            onCopyShare={() => void copyShare()}
            onCopyJson={() => void copyJson()}
            onReset={reset}
          />
        </section>
      </main>
      <footer className="site-foot">
        <p>Agent Contract · SMF Works</p>
        <p>
          Twin:{" "}
          <a href="https://github.com/smfworks/tool-permit">Tool Permit</a>
          {" — GO-list · "}
          <a href="https://github.com/smfworks/refuse-card">Refuse Card</a>
          {" — NO / HOLD · "}
          <a href="https://github.com/smfworks/agent-receipt">Agent Receipt</a>
          {" — what happened."}
        </p>
        <p>Intelligence is abundant. Judgment is the product.</p>
        <p>
          MIT · Built by{" "}
          <a href="https://smfworks.com" rel="noreferrer" target="_blank">
            SMF Works
          </a>
          {" · "}
          <a href="https://github.com/smfworks/agent-contract" rel="noreferrer" target="_blank">
            GitHub
          </a>
          {" · "}
          <a href="https://x.com/MichaelGannotti" rel="noreferrer" target="_blank">
            @MichaelGannotti
          </a>
        </p>
        <p className="fineprint">
          Lab artifact for communication. Not a legal contract, not legal
          advice, and not an enforcement runtime. A shareable agreement card
          is not a substitute for human review.
        </p>
      </footer>
      <Toast message={toast} />
    </div>
  );
}
