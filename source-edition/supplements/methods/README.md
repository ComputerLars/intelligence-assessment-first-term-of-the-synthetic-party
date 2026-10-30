# METHOD-A15-A08 · Technical recount

**Discord exchanges, input languages and operating costs · 26 October 2026**

[Danish-language screen](language/README.md) · [October reconciliation](OCTOBER-RECONCILIATION.md) · [Supplement register](../README.md)

This file counts exchanges with Leader Lars on The Synthetic Party’s Discord server and compares October 2022 activity with recorded cloud expenditure. The analysed Discord record [A15-D02](../../dossiers/A15.md#a15-d02) contains **5,097 completed input–response exchanges**: 289 under the Computer Lars label and **4,808 under other labels**. Counting follows numbered speaker starts and requires exactly one `-> Leder Lars:` reply per segment. Ten incomplete speaker fragments are excluded. These units count exchanges, not people, voters, members or provider API calls.

| Quantity | Inclusion rule | Result |
|---|---|---:|
| A15-D02 | Completed input–response segments | 5,097 |
| Other labels | Completed segments excluding the Computer Lars label | 4,808 |
| October, A15-D02 | Completed segments starting at rows 427–3222 | 2,592 |
| October, Members_Only export | Submitted bodies beginning with `!`, extraction IDs p00418–p03165 | 2,748 |
| September cloud consumption | A08-D12 | $9 |
| October cloud consumption | A08-D08 ($200) and A08-D05 ($170) | $370 |

## Input languages

The [Danish-specific screen](language/README.md) classifies **3,327 of the 4,808 inputs as non-Danish or mixed-language (69.2%)**, with 1,198 Danish or Danish-compatible inputs and 283 unclassified inputs. The denominator includes unclassified inputs. The counter, fixed corrections and row classifications accompany the result.

The classifications describe the earlier analysed witness, before this edition’s additional redactions. They establish neither nationality nor voting rights. The older figure of 3,454 non-Danish inputs is unverified: its underlying artwork procedure classified text fragments, not complete inputs, and cannot supply this census.

## October and costs

Seven source screenshots establish twelve date/time anchors. The selection is bounded by 30 September 2022 (before), 5 October (first included), 31 October (last included) and 1 November (after). They do not timestamp every message or establish platform completeness. Extraction IDs are retrospective locators; no UTC offset is inferred.

The two October exports measure different units. Ordered text matching accounts for their difference through 189 unmatched submitted commands and 33 unmatched completed segments: **189 − 33 = 156**. The [reconciliation](OCTOBER-RECONCILIATION.md) records the method and remaining uncertainty.

Invoice payment dates differ from consumption months. Dividing $370 by 2,748 gives **$0.1346 per submitted command**; dividing by 2,592 gives **$0.1427 per completed exchange**. These are descriptive ratios of monthly spending to selected exchanges, not matched per-call charges or a provider tariff.

## Reproduction

[Counter](recount_archive.py) · [Recorded counts](counts.json) · [Completed-unit row index](completed_unit_index.csv)

Run the counter against this edition, writing results outside it:

```sh
python recount_archive.py --archive /path/to/source-edition --out /path/to/results
```

The completed-unit index preserves the original analysis positions. Further redaction can change the visible prompt text without changing those positions. Reproducing the original language classifications requires the earlier analysed witness; their arithmetic can be checked from the included row classifications. The separate Members_Only export and occurrence crosswalk are not included.
