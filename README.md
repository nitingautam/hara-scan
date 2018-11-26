# Introduction 
Hara scan is API service for https://scan.haratoken.app

# API Domain
[>> Link : https://scan-api.haratoken.app/scan](https://scan-api.haratoken.app/scan)

# Design Review
[>> Go To Design Review Link](https://www.draw.io/?lightbox=1&highlight=0000ff&nav=1&title=hara-scan.xml#R1Vjbbts4EP0aP9rQxbKdR1%2BUbYA2G8RBu30KaJGWiFCklqJiu1%2B%2FQ4nUxVKcduFiNzESicPhcHjOcGackb9Oj39IlCVfBCZs5Dn4OPI3I89z3cUCHlpyqiSzm2kliCXFRqkRbOkPYoSOkRYUk7yjqIRgimZdYSQ4J5HqyJCU4tBV2wvW3TVDMekJthFifek3ilVSSReB08g%2FERondmfXMTM7FL3EUhTc7Dfy%2FH35U02nyNoy%2BnmCsDi0RH448tdSCFW9pcc1YRpbC1u17vaN2dpvSbj6mQVeteAVsYJYj0u%2F1MliAS5m%2BpWmJWirRKUMhi68vhKpKKC2ZDTmIFMia0k%2Fox1hDyKnigo9uxNKiRQUmJ5Y1UitBROy3Mti5a%2FKzZZ5VpHrgATZwZ4eCbYqME6U0lGx1If0biPMpxMKcbGnHBM5iWBH7xYjheCh5blWkqdMiXFUSMApOo0Rx%2BNIUD7WSHnBDP4SlRBJi%2FQ5YijPafRMVPSsdZ5TyimPx663mGQ8NvjBkcnxTQ7cmlm4MUSkRMkTqJgFcxs85rK4c3N7Dk3ouTZgknbYWSEy4R7XthvK4cWwPhwBs4EImDHYYZV14mD2d6GDcsUoJ2PrBYCunQ%2BaaXiLzZNVz9vsXLZjInrR%2BmRwhxTJmPLaeP07dbIjPEpDzk5IoLdS4oKTeiJDGAM%2FZrleccG1ticf0Ecr%2BLR81Ja26%2BV9e2FPX37oUy4f7vQhw8evd%2BvwF89pBXp1%2BPg53G4vGvgAsPRuVfemnSXxMtHqtFnm0kNCFdlmKNKzByjh3bR%2BhZzmLbo5zXODXk7zpgM5LbhCSpu%2FX9TerVHvVrlcSfFSdwdaD5n5CDDSzK9EoXS2XNdNisYeozypiRjUsAU3Pca6u5qgQ%2B7jCT5xlIrNDhT2lLFW0QzX%2BlO71JoJQv0ZKp5XoHh2VrUs4%2B2q5fiTufebCtfifZYJx0vdDWpSqjJeooSk6otbhAMA8vSXYaMcfNeDSVADR3CvfzyDDfwQhYxIJyJh55ioVt3tg9tCL7hwPSRhSNHXrhNDaJodHqBzUQ137gyIcW%2Ban%2B5l9Rddg9VRjI12N3lmFlqZy4YqAHqGSqprEH6K%2FZv%2FOfttqr3%2FkurAO%2Bdk%2Fu%2FI7Rlynd9FrrXcYte0OA%2BPd1%2BXT%2BF9%2BNSjGzKZ6jIpSU5%2FoF2poMnMtGuls8FqFGx0XiwU5P7y22c7gzOyV28nfqibUL%2Bf9GAznl4pmd4EHXB9byCb%2BgNRco1M6vo9uDff75df%2Ftxcaqnkm83Gh2bC1itLxEDjshjgwf91HmDYfNGvbknz3xQ%2F%2FAc%3D)

# Getting Started
Requirement:
1. Docker
2. docker-compose

Local Development
1.	[bash] ./run-dev.sh

# API Endpoint
1. [get_blocks](#get_blocks)
2. [get_transactions](#get_transactions)
3. [get_detail_transaction](#get_detail_transaction)
4. [get_alias_function](#get_alias_function)
5. [get_total_transaction](#get_total_transaction) 
6. [get_total_supply](#get_total_supply)

# API DETAIL
#### get_blocks
Get all `blocks` list of data sorted with `sort_key`

Params
- *limit [int] : you must set limit fo
- last_sort_key [string] : latest sory key, default `false`, if filled must set start from latest `sort_key` data

Return *JSON*
- message [string] : "success" and "failed"
- data [array] : [array of object]

#### get_transactions
Get all `transactions` list of data sorted with `sort_key`

Params
- *limit [int] : you must set limit fo
- last_sort_key [string] : latest sory key, default `false`, if filled must set start from latest `sort_key` data

Return *JSON*
- message [string] : "success" and "failed"
- data [array] : [array of object]

#### get_detail_transaction
Get detail of transaction

Params
- *txhash [string] : hash of transaction hash

Return *JSON*
- message [string] : "success" and "failed"
- data [obj] : [object]

#### get_alias_function
Run a web3 function via API service that hit private NODE Geth

Params
- *function [string] : function of web3, example "getTransactionReceipt"
- *params [array] : parameter of web3, so if you run web3 like web3.eth.getTransactionReceipt("*txHash*") so params just like 
ex : ["*txhash*"]

Return *JSON*
- message [string] : "success" and "failed"
- data [obj] : [object]

#### get_total_transaction
Get a total of transaction

Params : nothing

Return *JSON*
- message [string] : "success" and "failed"
- data [int] : total count of transaction