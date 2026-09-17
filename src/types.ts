export type ExpiryKind = "session" | "date";

export type ContractExpiry =
  | { kind: "session" }
  | { kind: "date"; date: string };

export interface ContractDraft {
  title: string;
  human: string;
  agent: string;
  goal: string;
  success: string[];
  stop: string[];
  scope: string;
  expiryKind: ExpiryKind;
  expiryDate: string;
}

export interface AgentContract {
  schema: "smf.agent-contract.v1";
  id: string;
  title: string;
  human: string;
  agent: string;
  goal: string;
  success: string[];
  stop: string[];
  scope: string;
  expiry: ContractExpiry;
  issuedAt: string;
  heuristic: true;
}

export interface SampleMeta {
  id: string;
  file: string;
  label: string;
  blurb: string;
  draft: ContractDraft;
}

export const CONTRACT_SCHEMA = "smf.agent-contract.v1" as const;

export const EMPTY_DRAFT: ContractDraft = {
  title: "",
  human: "",
  agent: "",
  goal: "",
  success: [],
  stop: [],
  scope: "",
  expiryKind: "session",
  expiryDate: "",
};

export const MAX_BULLET_LENGTH = 160;
export const MAX_BULLETS = 8;
