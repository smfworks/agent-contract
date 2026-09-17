import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { SAMPLES } from "../data/samples.ts";
import { EMPTY_DRAFT, CONTRACT_SCHEMA, type ContractDraft } from "../types.ts";
import {
  addBullet,
  canExport,
  cardId,
  draftFromContract,
  normalizeBullet,
  parseContractObject,
  parseContractText,
  contractToJson,
  removeBullet,
  serializeContract,
  slugify,
  uniqueBullets,
} from "./contract.ts";

const sampleDir = join(fileURLToPath(new URL(".", import.meta.url)), "../../public/samples");
const frozen = new Date("2026-09-17T11:15:00.000Z");

function loadPublicSample(id: string): unknown {
  return JSON.parse(readFileSync(join(sampleDir, `${id}.json`), "utf8"));
}

describe("normalizeBullet", () => {
  it("trims and collapses whitespace", () => {
    assert.equal(normalizeBullet("  Tests   pass  "), "Tests pass");
  });

  it("rejects empty bullets and caps length", () => {
    assert.equal(normalizeBullet("   "), null);
    const long = "x".repeat(200);
    assert.equal(normalizeBullet(long)?.length, 160);
  });
});

describe("uniqueBullets / add / remove", () => {
  it("dedupes case-insensitively and preserves first casing", () => {
    assert.deepEqual(uniqueBullets(["Tests pass", "tests pass", "PR opened"]), [
      "Tests pass",
      "PR opened",
    ]);
  });

  it("caps at eight bullets", () => {
    const many = Array.from({ length: 12 }, (_, i) => `Item ${i + 1}`);
    assert.equal(uniqueBullets(many).length, 8);
  });

  it("appends a new bullet once", () => {
    const next = addBullet(["Tests pass"], "PR opened");
    assert.deepEqual(next, ["Tests pass", "PR opened"]);
    assert.deepEqual(addBullet(next, "pr opened"), ["Tests pass", "PR opened"]);
  });

  it("removes by normalized text", () => {
    assert.deepEqual(removeBullet(["Tests pass", "PR opened"], "tests pass"), ["PR opened"]);
  });
});

describe("serializeContract", () => {
  it("emits a stable v1 agreement document", () => {
    const draft: ContractDraft = {
      title: "PR review session",
      human: "Staff engineer",
      agent: "Review bot",
      goal: "Leave review comments.",
      success: ["Every file reviewed"],
      stop: ["Do not merge"],
      scope: "This pull request only.",
      expiryKind: "session",
      expiryDate: "ignored",
      };
    const contract = serializeContract(draft, frozen);
    assert.equal(contract.schema, CONTRACT_SCHEMA);
    assert.match(contract.id, /^AC-[0-9A-F]{4}$/);
    assert.equal(contract.issuedAt, frozen.toISOString());
    assert.equal(contract.heuristic, true);
    assert.deepEqual(contract.expiry, { kind: "session" });
    assert.deepEqual(contract.success, ["Every file reviewed"]);
    assert.deepEqual(contract.stop, ["Do not merge"]);
    assert.equal(canExport(contract), true);
  });

  it("keeps a dated expiry when YYYY-MM-DD is present", () => {
    const contract = serializeContract(
      {
        ...EMPTY_DRAFT,
        title: "Literature pass",
        human: "Lab lead",
        agent: "Scout",
        goal: "Write a brief.",
        success: ["Sources cited"],
        stop: ["Do not send email"],
        expiryKind: "date",
        expiryDate: "2026-12-31",
      },
      frozen,
    );
    assert.deepEqual(contract.expiry, { kind: "date", date: "2026-12-31" });
  });

  it("falls back to session when the date is blank or invalid", () => {
    const base = {
      ...EMPTY_DRAFT,
      title: "A",
      human: "H",
      agent: "Ag",
      goal: "G",
      success: ["S"],
      stop: ["N"],
      expiryKind: "date" as const,
    };
    const blank = serializeContract({ ...base, expiryDate: "" }, frozen);
    const bad = serializeContract({ ...base, expiryDate: "soon" }, frozen);
    assert.deepEqual(blank.expiry, { kind: "session" });
    assert.deepEqual(bad.expiry, { kind: "session" });
  });

  it("is deterministic for the same draft + clock", () => {
    const a = serializeContract(SAMPLES[0].draft, frozen);
    const b = serializeContract(SAMPLES[0].draft, frozen);
    assert.deepEqual(a, b);
  });

  it("changes the serial when success criteria change", () => {
    const base = serializeContract(SAMPLES[0].draft, frozen);
    const tweaked = serializeContract(
      { ...SAMPLES[0].draft, success: [...SAMPLES[0].draft.success, "Extra"] },
      frozen,
    );
    assert.notEqual(base.id, tweaked.id);
  });

  it("does not export until parties, goal, success, and stop are filled", () => {
    const missingStop = serializeContract(
      { ...SAMPLES[0].draft, stop: [] },
      frozen,
    );
    const missingHuman = serializeContract(
      { ...SAMPLES[0].draft, human: "" },
      frozen,
    );
    assert.equal(canExport(missingStop), false);
    assert.equal(canExport(missingHuman), false);
    assert.equal(canExport(serializeContract(EMPTY_DRAFT, frozen)), false);
  });
});

describe("JSON roundtrip", () => {
  it("parses its own pretty JSON", () => {
    const contract = serializeContract(SAMPLES[2].draft, frozen);
    const parsed = parseContractText(contractToJson(contract));
    assert.ok(parsed);
    const again = serializeContract(parsed, frozen);
    assert.deepEqual(again.success, contract.success);
    assert.deepEqual(again.stop, contract.stop);
    assert.deepEqual(again.expiry, contract.expiry);
    assert.equal(again.title, contract.title);
    assert.equal(again.human, contract.human);
    assert.equal(again.agent, contract.agent);
    assert.equal(again.goal, contract.goal);
    assert.equal(again.scope, contract.scope);
  });

  it("accepts successCriteria / mustNot / parties aliases", () => {
    const parsed = parseContractObject({
      name: "Alias pact",
      parties: { human: "Operator", agent: "Clerk" },
      objective: "Draft replies.",
      successCriteria: ["Drafts ready"],
      mustNot: ["Never send mail"],
      expiryKind: "date",
      expiryDate: "2026-10-01",
    });
    assert.ok(parsed);
    assert.equal(parsed.title, "Alias pact");
    assert.equal(parsed.human, "Operator");
    assert.equal(parsed.agent, "Clerk");
    assert.equal(parsed.goal, "Draft replies.");
    assert.deepEqual(parsed.success, ["Drafts ready"]);
    assert.deepEqual(parsed.stop, ["Never send mail"]);
    assert.equal(parsed.expiryKind, "date");
    assert.equal(parsed.expiryDate, "2026-10-01");
  });

  it("returns null for empty / non-JSON", () => {
    assert.equal(parseContractText("   "), null);
    assert.equal(parseContractText("not json"), null);
    assert.equal(parseContractObject({}), null);
  });

  it("draftFromContract roundtrips into serializeContract", () => {
    const contract = serializeContract(SAMPLES[1].draft, frozen);
    const draft = draftFromContract(contract);
    const again = serializeContract(draft, frozen);
    assert.deepEqual(again.success, contract.success);
    assert.deepEqual(again.stop, contract.stop);
    assert.deepEqual(again.expiry, contract.expiry);
  });
});

describe("public samples", () => {
  for (const sample of SAMPLES) {
    it(`${sample.id} JSON matches the in-app draft after serialize`, () => {
      const file = loadPublicSample(sample.id);
      const fromFile = parseContractObject(file);
      assert.ok(fromFile, `failed to parse ${sample.id}.json`);
      const expected = serializeContract(sample.draft, frozen);
      const actual = serializeContract(fromFile, frozen);
      assert.deepEqual(actual.success, expected.success);
      assert.deepEqual(actual.stop, expected.stop);
      assert.deepEqual(actual.expiry, expected.expiry);
      assert.equal(actual.title, expected.title);
      assert.equal(actual.human, expected.human);
      assert.equal(actual.agent, expected.agent);
      assert.equal(actual.goal, expected.goal);
      assert.equal(actual.scope, expected.scope);
      assert.equal(canExport(actual), true);
      assert.ok(actual.success.length >= 2, "sample should ship real success criteria");
      assert.ok(actual.stop.length >= 2, "sample should ship real stop conditions");
    });
  }

  it("ships four named samples", () => {
    assert.deepEqual(
      SAMPLES.map((sample) => sample.id),
      ["pr-review", "research-brief", "ship-a-fix", "inbox-drafts"],
    );
  });
});

describe("helpers", () => {
  it("builds a stable AC id", () => {
    assert.equal(cardId("same"), cardId("same"));
    assert.notEqual(cardId("same"), cardId("other"));
    assert.match(cardId("same"), /^AC-[0-9A-F]{4}$/);
  });

  it("slugifies download names", () => {
    assert.equal(slugify("PR review session"), "pr-review-session");
    assert.equal(slugify("   "), "contract");
  });
});
