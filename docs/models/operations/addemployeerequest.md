# AddEmployeeRequest


## Fields

| Field                                                                              | Type                                                                               | Required                                                                           | Description                                                                        |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `xConnectionToken`                                                                 | *string*                                                                           | :heavy_check_mark:                                                                 | The connection token                                                               |
| `remoteData`                                                                       | *boolean*                                                                          | :heavy_minus_sign:                                                                 | Set to true to include data from the original Hris software.                       |
| `unifiedEmployeeInput`                                                             | [components.UnifiedEmployeeInput](../../models/components/unifiedemployeeinput.md) | :heavy_check_mark:                                                                 | N/A                                                                                |