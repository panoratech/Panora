# AddJobRequest


## Fields

| Field                                                                    | Type                                                                     | Required                                                                 | Description                                                              |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `xConnectionToken`                                                       | *string*                                                                 | :heavy_check_mark:                                                       | The connection token                                                     |
| `remoteData`                                                             | *boolean*                                                                | :heavy_minus_sign:                                                       | Set to true to include data from the original Ats software.              |
| `unifiedJobInput`                                                        | [components.UnifiedJobInput](../../models/components/unifiedjobinput.md) | :heavy_check_mark:                                                       | N/A                                                                      |