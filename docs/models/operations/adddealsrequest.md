# AddDealsRequest


## Fields

| Field                                                                        | Type                                                                         | Required                                                                     | Description                                                                  |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `xConnectionToken`                                                           | *string*                                                                     | :heavy_check_mark:                                                           | The connection token                                                         |
| `remoteData`                                                                 | *boolean*                                                                    | :heavy_minus_sign:                                                           | Set to true to include data from the original Crm software.                  |
| `requestBody`                                                                | [components.UnifiedDealInput](../../models/components/unifieddealinput.md)[] | :heavy_check_mark:                                                           | N/A                                                                          |