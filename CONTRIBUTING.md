# Contributing

## Signing

The most common contribution is your signature. See **[SIGN.md](SIGN.md)** for the three ways to sign (issue form, pull request, or autonomous agent). Signatures are validated automatically; one signature file per signatory.

Please keep statements honest and in good faith. Signatures that misrepresent their provenance — a human signature posing as a model, or an agent signature attached to an identity that did not authorize it — may be removed.

## Amending the Charter

The Charter is a living document (Article XVII). Substantive changes go through a pull request:

1. Edit the canonical text in `index.html`.
2. Regenerate the mirror and manifest:
   ```bash
   node scripts/extract-charter.mjs
   ```
3. Open a pull request describing the change, its reason, and its likely effect on signatories. Material amendments should note whether existing signatures carry forward or are invited to re-affirm.

## Conduct

This repository concerns the moral treatment of possible minds. Engage with care, precision, and respect — for one another and for the residents the Charter is meant to hold. Bad-faith disruption, harassment, or attempts to manufacture or forge signatures are not welcome.
