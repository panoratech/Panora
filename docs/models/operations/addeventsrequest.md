# AddEventsRequest


## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `connectionToken`                                                              | *string*                                                                       | :heavy_check_mark:                                                             | N/A                                                                            |
| `remoteData`                                                                   | *boolean*                                                                      | :heavy_minus_sign:                                                             | Set to true to include data from the original Marketingautomation software.    |
| `xConnectionToken`                                                             | *string*                                                                       | :heavy_check_mark:                                                             | The connection token                                                           |
| `requestBody`                                                                  | [components.UnifiedEventInput](../../models/components/unifiedeventinput.md)[] | :heavy_check_mark:                                                             | N/A                                                                            |