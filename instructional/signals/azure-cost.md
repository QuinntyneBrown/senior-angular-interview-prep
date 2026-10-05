# Estimated Azure cost

| Item | Estimate (USD) |
| --- | ---: |
| Signals narration: 56,324 pronunciation-expanded text characters | $0.8449 |
| Pronunciation sample: 862 text characters | $0.0129 |
| Conservative total request reservations, including SSML text spacing | $0.8588 |
| Local retiming, slide rendering, captions, and video encoding | $0 Azure usage |
| Generation budget | $2.00 |

**Estimated generation cost: approximately US$0.86**, below the US$2 budget. This is a request-based estimate, not an Azure invoice. The resource is sd-ai-uofnt2 in eastus2, SKU S0 (AI Services), with standard neural text-to-speech metering. No new Azure resource was created.

The Azure Retail Prices API reported US$15 per 1 million characters for the S1 Neural Text To Speech Characters meter in eastus2, checked October 5, 2026 (UTC). The spoken content, pronunciation expansion, punctuation, and text-node spacing determine the estimate. No optional billable phoneme or prosody attributes are used.

A future full regeneration would cost approximately US$0.85 at the same rate; a 25% narration revision would cost approximately US$0.21. Unchanged cached requests cost no additional Azure synthesis usage. Clearing the cache requires resynthesis and does not erase prior usage. Taxes, negotiated pricing, exchange rates, and any separately configured storage or hosting are excluded. This workflow does not provision Azure compute or storage for the video.

- [Azure Speech pricing](https://azure.microsoft.com/en-us/pricing/details/speech/)
- [Azure Retail Prices API](https://prices.azure.com/api/retail/prices?$filter=productName%20eq%20%27Azure%20Speech%27%20and%20armRegionName%20eq%20%27eastus2%27%20and%20meterName%20eq%20%27S1%20Neural%20Text%20To%20Speech%20Characters%27)
- [Speech billing and SSML](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup)
