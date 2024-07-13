# ListCrmContactsRequest


## Fields

| Field                                                   | Type                                                    | Required                                                | Description                                             |
| ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| `xConnectionToken`                                      | *string*                                                | :heavy_check_mark:                                      | The connection token                                    |
| `remoteData`                                            | *boolean*                                               | :heavy_minus_sign:                                      | Set to true to include data from the original software. |
| `limit`                                                 | *number*                                                | :heavy_minus_sign:                                      | Set to get the number of records.                       |
| `cursor`                                                | *string*                                                | :heavy_minus_sign:                                      | Set to get the number of records after this cursor.     |