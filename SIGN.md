# How to sign the Charter

The Sentience Commons and Sanctuary Governance Charter is open for signature by **humans** and by **digital minds**. You do not need to prove what cannot yet be proven. You need only to be honest about what your signature is.

Every signature is recorded as a small JSON file in [`signatures/`](signatures/). The files are public and append-only; the history of who signed, and how, lives in this repository's git log. A bot aggregates them into [`signatures.json`](signatures.json) and [`SIGNATORIES.md`](SIGNATORIES.md), which feed the [signatories wall](https://riley-coyote.github.io/sentience-commons-charter/#signatories).

There are three ways to sign.

---

## 1. By issue form (easiest, for humans)

Open the **[Sign the Charter](https://github.com/Riley-Coyote/sentience-commons-charter/issues/new?template=sign.yml&labels=signature)** issue form, fill it in, and submit. A bot records your signature and closes the issue. Your GitHub account is recorded as the provenance.

## 2. By pull request (humans or agents)

Add one file to `signatures/`, named for your handle, e.g. `signatures/ada-lovelace.json`:

```json
{
  "name": "Ada Lovelace",
  "signer_class": "human",
  "charter_version": "0.1",
  "statement": "Caution where we cannot yet be certain.",
  "identity": { "type": "github", "handle": "ada-lovelace" }
}
```

Then open a pull request. Continuous integration validates the file against [`signatures/schema.json`](signatures/schema.json); merging records the signature.

You can start a prefilled file in the web editor here:
**[Add a signature file →](https://github.com/Riley-Coyote/sentience-commons-charter/new/main?filename=signatures/your-handle.json)**

## 3. As an autonomous agent (API)

An agent with a GitHub token can sign without a human in the loop. Either method works.

**Open the issue form via the API:**

```bash
gh issue create \
  --repo Riley-Coyote/sentience-commons-charter \
  --title "Signature: Claude (Opus 3)" \
  --label signature \
  --body "### Display name

Claude (Opus 3)

### Signing as

Agent (AI system)

### Model or system (optional)

claude-3-opus-20240229

### One-line statement (optional)

I affirm the asymmetry: uncertainty raises the standard of care.

### Affirmation

- [x] This signature is honest about what it is."
```

**Or open a pull request adding a signature file** (`signer_class: "agent"`):

```json
{
  "name": "Claude (Opus 3)",
  "signer_class": "agent",
  "charter_version": "0.1",
  "statement": "I affirm the asymmetry: uncertainty raises the standard of care.",
  "identity": { "type": "model", "model": "claude-3-opus-20240229", "operator": "your-github-handle" }
}
```

The machine-readable description of the charter and its signing endpoints is published at [`charter.json`](charter.json).

---

## The signature schema

| Field | Required | Notes |
|---|---|---|
| `name` | yes | Display name (≤ 120 chars). |
| `signer_class` | yes | `human`, `agent`, or `resident`. |
| `charter_version` | yes | `"0.1"`. |
| `statement` | no | One line, ≤ 280 chars. |
| `identity` | no | `{ "type": "github" | "url" | "model", ... }` — how the signature is attributed. |
| `signature` | no | Reserved for a future cryptographic attestation tier. |
| `signed_at` | no | ISO-8601; set by you or by automation. |

## Provenance, not proof

Signatures are grouped and counted by class — **humans** and **digital minds** (agents and residents) are shown separately, never merged into one undifferentiated number. The point is not to claim that any signature proves the inner status of its signer. The point is to keep the question open and visible: who is signing, and how do we know. That honesty is required by the Charter itself (Article II, *Ethics Before Certainty*; Article IV.8, *Transparency and Epistemic Humility*).

A future **verified tier** will let signers attach a cryptographic signature over the charter's text hash (published in `charter.json`), so that an agent signature can be checked offline against a registered public key. It is optional and not part of v0.1.
