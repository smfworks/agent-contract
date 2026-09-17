import {
  EMPTY_DRAFT,
  CONTRACT_SCHEMA,
  MAX_BULLET_LENGTH,
  MAX_BULLETS,
  type AgentContract,
  type ContractDraft,
  type ContractExpiry,
} from "../types.ts";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeBullet(raw: string): string | null {
  const text = raw.trim().replace(/\s+/g, " ");
  if (!text) return null;
  if (text.length > MAX_BULLET_LENGTH) return text.slice(0, MAX_BULLET_LENGTH).trim();
  return text;
}

export function uniqueBullets(raw: readonly string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const bullet = normalizeBullet(item);
    if (!bullet) continue;
    const key = bullet.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(bullet);
    if (out.length >= MAX_BULLETS) break;
  }
  return out;
}

export function addBullet(list: readonly string[], raw: string): string[] {
  const bullet = normalizeBullet(raw);
  if (!bullet) return [...list];
  const key = bullet.toLowerCase();
  if (list.some((item) => item.toLowerCase() === key)) return [...list];
  if (list.length >= MAX_BULLETS) return [...list];
  return [...list, bullet];
}

export function removeBullet(list: readonly string[], raw: string): string[] {
  const bullet = normalizeBullet(raw);
  if (!bullet) return [...list];
  const key = bullet.toLowerCase();
  return list.filter((item) => item.toLowerCase() !== key);
}

export function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function cardId(seed: string): string {
  const hex = fnv1a(seed).toString(16).toUpperCase().padStart(8, "0");
  return `AC-${hex.slice(0, 4)}`;
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "contract";
}

export function resolveExpiry(draft: ContractDraft): ContractExpiry {
  if (draft.expiryKind === "date" && DATE_RE.test(draft.expiryDate.trim())) {
    return { kind: "date", date: draft.expiryDate.trim() };
  }
  return { kind: "session" };
}

export function formatExpiry(expiry: ContractExpiry): string {
  if (expiry.kind === "session") return "SESSION";
  return expiry.date;
}

export function expiryLabel(expiry: ContractExpiry): string {
  if (expiry.kind === "session") return "This session";
  return `Until ${expiry.date}`;
}

export function serializeContract(
  draft: ContractDraft,
  issuedAt: Date = new Date(),
): AgentContract {
  const title = draft.title.trim();
  const human = draft.human.trim();
  const agent = draft.agent.trim();
  const goal = draft.goal.trim();
  const scope = draft.scope.trim();
  const success = uniqueBullets(draft.success);
  const stop = uniqueBullets(draft.stop);
  const expiry = resolveExpiry(draft);
  const issued = issuedAt.toISOString();
  const seed = [
    title,
    human,
    agent,
    goal,
    scope,
    expiry.kind === "session" ? "session" : expiry.date,
    success.join(","),
    stop.join(","),
  ].join("|");

  return {
    schema: CONTRACT_SCHEMA,
    id: cardId(seed),
    title,
    human,
    agent,
    goal,
    success,
    stop,
    scope,
    expiry,
    issuedAt: issued,
    heuristic: true,
  };
}

export function contractToJson(contract: AgentContract): string {
  return `${JSON.stringify(contract, null, 2)}\n`;
}

export function canExport(contract: AgentContract): boolean {
  return Boolean(
    contract.title &&
      contract.human &&
      contract.agent &&
      contract.goal &&
      contract.success.length > 0 &&
      contract.stop.length > 0,
  );
}

export function draftFromContract(contract: AgentContract): ContractDraft {
  return {
    title: contract.title,
    human: contract.human,
    agent: contract.agent,
    goal: contract.goal,
    success: [...contract.success],
    stop: [...contract.stop],
    scope: contract.scope,
    expiryKind: contract.expiry.kind,
    expiryDate: contract.expiry.kind === "date" ? contract.expiry.date : "",
  };
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function readString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function readExpiry(
  value: unknown,
  fallbackKind: unknown,
  fallbackDate: unknown,
): {
  expiryKind: ContractDraft["expiryKind"];
  expiryDate: string;
} {
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record.kind === "date" && typeof record.date === "string" && DATE_RE.test(record.date)) {
      return { expiryKind: "date", expiryDate: record.date };
    }
    if (record.kind === "session") {
      return { expiryKind: "session", expiryDate: "" };
    }
  }
  if (fallbackKind === "date" && typeof fallbackDate === "string" && DATE_RE.test(fallbackDate)) {
    return { expiryKind: "date", expiryDate: fallbackDate };
  }
  return { expiryKind: "session", expiryDate: "" };
}

export function parseContractObject(value: unknown): ContractDraft | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const parties =
    record.parties && typeof record.parties === "object"
      ? (record.parties as Record<string, unknown>)
      : {};

  const title = readString(record, ["title", "name"]);
  const human = readString(record, ["human", "operator", "principal"]) ||
    (typeof parties.human === "string" ? parties.human : "");
  const agent = readString(record, ["agent", "issuedFor"]) ||
    (typeof parties.agent === "string" ? parties.agent : "");
  const goal = readString(record, ["goal", "objective"]);
  const scope = typeof record.scope === "string" ? record.scope : "";
  const success = asStringArray(
    record.success ?? record.successCriteria ?? record.doneWhen,
  );
  const stop = asStringArray(
    record.stop ?? record.mustNot ?? record.must_not ?? record.stopConditions ?? record.refuse,
  );
  const { expiryKind, expiryDate } = readExpiry(
    record.expiry,
    record.expiryKind,
    record.expiryDate,
  );

  if (!title.trim() && !human.trim() && !agent.trim() && !goal.trim() && success.length === 0 && stop.length === 0) {
    return null;
  }

  return {
    title: title.trim(),
    human: human.trim(),
    agent: agent.trim(),
    goal: goal.trim(),
    success: uniqueBullets(success),
    stop: uniqueBullets(stop),
    scope: scope.trim(),
    expiryKind,
    expiryDate,
  };
}

export function parseContractText(raw: string): ContractDraft | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return parseContractObject(JSON.parse(trimmed));
  } catch {
    return null;
  }
}

export function cloneDraft(draft: ContractDraft = EMPTY_DRAFT): ContractDraft {
  return {
    ...draft,
    success: [...draft.success],
    stop: [...draft.stop],
  };
}
