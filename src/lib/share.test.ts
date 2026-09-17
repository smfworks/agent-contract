import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SAMPLES } from "../data/samples.ts";
import { serializeContract } from "./contract.ts";
import { formatCompactStats, formatShareText, formatStampTime } from "./share.ts";

const frozen = new Date("2026-09-17T11:15:00.000Z");

describe("formatShareText", () => {
  it("prints an agreement block for PR review", () => {
    const contract = serializeContract(SAMPLES[0].draft, frozen);
    const text = formatShareText(contract);
    assert.match(text, /^📜 Agent Contract/);
    assert.match(text, /PR review session/);
    assert.match(text, /Human: Staff engineer {2}· {2}Agent: Review bot/);
    assert.match(text, /SUCCESS/);
    assert.match(text, /• Every changed file has a comment or an explicit LGTM/);
    assert.match(text, /STOP \/ MUST NOT/);
    assert.match(text, /• Do not merge, push, or approve as the human/);
    assert.match(text, /Expiry: This session/);
    assert.match(text, /github.com\/smfworks\/agent-contract/);
  });

  it("omits an empty scope line", () => {
    const contract = serializeContract(
      { ...SAMPLES[0].draft, scope: "" },
      frozen,
    );
    const text = formatShareText(contract);
    assert.equal(text.includes("Scope:"), false);
  });
});

describe("formatCompactStats", () => {
  it("summarizes counts and expiry", () => {
    const session = serializeContract(SAMPLES[0].draft, frozen);
    const dated = serializeContract(SAMPLES[1].draft, frozen);
    assert.equal(formatCompactStats(session), "3 success · 3 stop · session");
    assert.equal(formatCompactStats(dated), "3 success · 3 stop · 2026-12-31");
  });
});

describe("formatStampTime", () => {
  it("prints a UTC lab stamp", () => {
    assert.equal(formatStampTime(frozen.toISOString()), "17 Sep 2026 · 11:15 UTC");
  });
});
