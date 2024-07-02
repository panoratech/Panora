# AddScoreCardRequest


## Fields

| Field                                                                                | Type                                                                                 | Required                                                                             | Description                                                                          |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `xConnectionToken`                                                                   | *string*                                                                             | :heavy_check_mark:                                                                   | The connection token                                                                 |
| `remoteData`                                                                         | *boolean*                                                                            | :heavy_minus_sign:                                                                   | Set to true to include data from the original Ats software.                          |
| `unifiedScoreCardInput`                                                              | [components.UnifiedScoreCardInput](../../models/components/unifiedscorecardinput.md) | :heavy_check_mark:                                                                   | N/A                                                                                  |