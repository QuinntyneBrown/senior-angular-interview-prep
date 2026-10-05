# Estimated Azure speech cost

| Item | Estimate (USD) |
| --- | ---: |
| 33,952 reserved text characters, including retries | $0.5093 |
| Local retiming, slides, captions, and encoding | $0 Azure usage |
| Shared additional spending cap for all six lessons | $10.00 |

**Estimated request cost: US$0.51.** This is a local request reservation estimate, not an Azure invoice. Shared cached text is charged to the lesson whose request generated it. The existing sd-ai-uofnt2 resource in eastus2 supplies Andrew and Ava neural voices; no new Azure resource was provisioned.

The Azure Retail Prices API returned US$15 per million standard neural characters in eastus2 on 2026-10-05. Retries reserve their cost before sending. The series ledger includes earlier signals spending and is never reset to bypass the cap. Cached synthesis and local processing add no speech charge. Taxes, contract discounts, currency conversion, and separately configured hosting are excluded.

[Azure Speech pricing](https://azure.microsoft.com/en-us/pricing/details/speech/) · [Retail Prices API](https://prices.azure.com/api/retail/prices) · [Speech billing and SSML](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup)
