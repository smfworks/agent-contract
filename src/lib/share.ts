import type { AgentContract } from "../types.ts";
import { expiryLabel } from "./contract.ts";

const SHARE_URL = "https://github.com/smfworks/agent-contract";

export function formatStampTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${dd} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()} · ${hh}:${mm} UTC`;
}

export function formatShareText(contract: AgentContract): string {
  const success = contract.success.map((line) => `• ${line}`).join("\n");
  const stop = contract.stop.map((line) => `• ${line}`).join("\n");
  const lines = [
    "📜 Agent Contract",
    contract.title || "Untitled agreement",
    `Human: ${contract.human || "—"}  ·  Agent: ${contract.agent || "—"}`,
    contract.goal ? `Goal: ${contract.goal}` : "",
    "",
    "SUCCESS",
    success || "• (none)",
    "",
    "STOP / MUST NOT",
    stop || "• (none)",
  ];
  if (contract.scope) {
    lines.push("", `Scope: ${contract.scope}`);
  }
  lines.push("", `Expiry: ${expiryLabel(contract.expiry)}`);
  lines.push("", "Agent Contract · SMF Works", SHARE_URL);
  return lines
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");
}

export function formatCompactStats(contract: AgentContract): string {
  const expiry = contract.expiry.kind === "session" ? "session" : contract.expiry.date;
  return `${contract.success.length} success · ${contract.stop.length} stop · ${expiry}`;
}
