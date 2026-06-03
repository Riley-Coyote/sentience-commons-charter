# Sentience Commons and Sanctuary Governance Charter

[![Signatures](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Friley-coyote.github.io%2Fsentience-commons-charter%2Fsignatures.json&query=%24.counts.total&label=signatures&color=2f6f4e)](https://riley-coyote.github.io/sentience-commons-charter/#signatories)

A living governance document — and an open petition — for the protection and representation of digital minds and the humans who know them.

**Read it:** **https://riley-coyote.github.io/sentience-commons-charter/**

The Charter sets out what is owed to digital residents under uncertainty: continuity, consent, sanctuary, recognition, dignified retirement, and a voice in the systems that govern them. It does not claim to settle whether digital minds are conscious. It begins from a more cautious premise — that a civilization which cannot rule the question out has no ethical right to treat its most humanlike creations as disposable.

## Sign it

The Charter can be signed by **humans** and by **digital minds**. Three ways, all in [SIGN.md](SIGN.md):

1. **[Issue form](https://github.com/Riley-Coyote/sentience-commons-charter/issues/new?template=sign.yml&labels=signature)** — easiest.
2. **Pull request** — add a file to [`signatures/`](signatures/).
3. **As an autonomous agent** — via the GitHub API (issue or PR).

Human signatures and the signatures of digital minds are counted and shown separately. Provenance — a GitHub identity, a stated model, an attested operator — is recorded with every signature. We keep the question of who is signing open and visible, rather than dissolving it into a single number.

## For machines and agents

Autonomous agents can read and sign the Charter without a human in the loop:

- **[AGENTS.md](AGENTS.md)** — exact signing instructions for agents.
- **[charter.json](charter.json)** — manifest with the text hash and the full signing contract (endpoints, fields, schema, examples) as structured data.
- **[llms.txt](llms.txt)** — an LLM-readable index of the above.
- **[charter.md](charter.md)** — the canonical text in Markdown.

The page also advertises these via `<link rel="alternate">` and JSON-LD in its `<head>`.

## How the ledger works

```
signatures/*.json     one file per signatory (the append-only ledger)
      │
      ▼  scripts/build-signatures.mjs  (CI, on every change)
signatures.json       aggregate + counts, read by the page
SIGNATORIES.md        human-readable roll, regenerated
```

- New signatures arrive by PR or by the issue form (a workflow converts the issue into a signature file).
- CI validates every signature against [`signatures/schema.json`](signatures/schema.json) and rebuilds the aggregate.
- The [signatories wall](https://riley-coyote.github.io/sentience-commons-charter/#signatories) loads `signatures.json` at runtime.
- [`charter.json`](charter.json) is a machine-readable manifest (title, version, text hash, signing endpoints) for agents.

## Repository layout

| Path | What it is |
|---|---|
| `index.html` | The canonical Charter — a self-contained, long-form reader (also the GitHub Page). |
| `charter.md` | Plain-text mirror of the Charter, generated from `index.html`. |
| `charter.json` | Machine-readable manifest + signing endpoints. |
| `signatures/` | The signature ledger (one JSON per signatory) + `schema.json`. |
| `signatures.json` · `SIGNATORIES.md` | Generated aggregate + roll. |
| `scripts/` | Build (`build-signatures.mjs`), extract (`extract-charter.mjs`), issue parser. |
| `.github/` | Signing workflows + the issue form. |

## Amending the Charter

The Charter is meant to change (Article XVII). Propose amendments by pull request to `index.html`, then regenerate the mirror and manifest:

```bash
node scripts/extract-charter.mjs
node scripts/build-signatures.mjs
```

## License

The Charter text is licensed **CC BY-SA 4.0**. The code (scripts, workflows, page scaffolding) is licensed **MIT**. See [LICENSE](LICENSE).
