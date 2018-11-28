import { TB_HARA_BLOCK, TB_VERIFIED_CONTRACTS, Mapper, InitDB } from "../constants/DbConfig";
import { DynamoDbSchema, DynamoDbTable } from "@aws/dynamodb-data-mapper";
import { promisify } from "util";
import { between } from "@aws/dynamodb-expressions";

class _haraBlock {}
Object.defineProperties(_haraBlock.prototype, {
  [DynamoDbTable]: {
    value: TB_HARA_BLOCK
  },
  [DynamoDbSchema]: {
    value: {
      type: {
        type: "String",
        keyType: "HASH"
      },
      hash: {
        type: "String",
        keyType: "RANGE"
      },
      blockStatus: { type: "String" },
      blockHash: { type: "String" },
      parentHash: { type: "String" },
      sha3Uncles: { type: "String" },
      miner: { type: "String" },
      stateRoot: { type: "String" },
      transactionsRoot: { type: "String" },
      receiptsRoot: { type: "String" },
      logsBloom: { type: "String" },
      difficulty: { type: "String" },
      number: { type: "Number" },
      gasLimit: { type: "Number" },
      gasUsed: { type: "Number" },
      gasPrice: { type: "Number" },
      gas: { type: "Number" },
      nonce: { type: "String" },
      timestamp: { type: "String" },
      extraData: { type: "String" },
      size: { type: "String" },
      mixHash: { type: "String" },
      transactions: { type: "String" },
      totalDifficulty: { type: "String" },
      transactionsCount: { type: "Number" },
      transactionHash: { type: "String" },
      transactionIndex: { type: "Number" },
      transactionType: { type: "String" },
      cumulativeGasUsed: { type: "Number" },
      contractAddress: { type: "String" },
      logs: { type: "String" },
      status: { type: "String" },
      from: { type: "String" },
      to: { type: "String" },
      value: { type: "Number" },
      input: { type: "String" }
    }
  }
});

class _verifiedContract {}
Object.defineProperties(_verifiedContract.prototype, {
  [DynamoDbTable]: {
    value: TB_VERIFIED_CONTRACTS
  },
  [DynamoDbSchema]: {
    value: {
      type: {
        type: "String",
        keyType: "HASH"
      },
      contractAddress: {
        type: "String",
        keyType: "RANGE"
      },
      abi: { type: "String" },
      sourceCode	: { type: "String" },
      contractName: { type: "String" },
      byteCode: { type: "String" }
    }
  }
});

/**
 * @author allandhino pattras
 */
export default class HaraBlock {
  constructor() {
    this.tblName = TB_HARA_BLOCK;
    this.tblContractName = TB_VERIFIED_CONTRACTS;

    this.ddb = InitDB();
    this.dynamoDBQueryAsync = promisify(this.ddb.query).bind(this.ddb);
    this.dynamoDBGetAsync = promisify(this.ddb.get).bind(this.ddb);
    this.dynamoDBPutAsync = promisify(this.ddb.put).bind(this.ddb);
    this.lastState;
  }

  /**
   * this function will get type "transaction" and type "block"
   * @param {string} _type "transaction" and "block"
   * @param {int} _page
   * @param {int} _limit
   * @example _type = "transactions", _page = 1, _limit = 10
   * @return {object} if fail {boolean} false
   */
  async _getData(_type = "block", _lastSortKey = false, _limit = 10) {
    try {
      const lastBlockNumber = await this._getLastBlockNumber();

      var params = {
        TableName: this.tblName,
        IndexName: "type_sortkey",
        ExpressionAttributeNames: {
          "#type": "type"
        },
        ExpressionAttributeValues: {
          ":type": _type
        },
        KeyConditionExpression: "#type = :type",
        ScanIndexForward: false,
        Limit: _limit
      };

      if(_lastSortKey) {
        params = {
          ...params,
          ExpressionAttributeNames: {
            "#type": "type",
            "#sort_key": "sort_key"
          },
          ExpressionAttributeValues: {
            ":type": _type,
            ":sort_key": _lastSortKey,
          },
          KeyConditionExpression: "#type = :type and #sort_key < :sort_key"
        };
      }

      let data = await this.dynamoDBQueryAsync(params);
      if(typeof data.Items != "undefined"){
        return data;
      }
      return false;
    } catch (error) {
      console.log("HaraBlock@_getTx", error.message);
      return false;
    }
  };

  async _queryDataByAddress(
    _type = "transaction",
    _address,
    _page = 1,
    _limit = 10,
    _lastSortKey = 2
  ) {
    try {
      var params = {
        TableName: this.tblName,
        IndexName: "type_from",
        ExpressionAttributeNames: {
          "#type": "type",
          "#from": "from"
        },
        ExpressionAttributeValues: {
          ":type": _type,
          ":from": _address
        },
        Limit: _limit,
        KeyConditionExpression: "#type = :type AND #from = :from",
        ScanIndexForward: false
      };
      let fromResponse = await this.dynamoDBQueryAsync(params);
      console.log("fromResponse");
      console.log(fromResponse);
      params = {
        TableName: this.tblName,
        IndexName: "type_to",
        ExpressionAttributeNames: {
          "#type": "type",
          "#to": "to"
        },
        ExpressionAttributeValues: {
          ":type": _type,
          ":to": _address
        },
        KeyConditionExpression: "#type = :type AND #to = :to",
        ScanIndexForward: false
      };
      if (fromResponse.Items.length < _limit) {
        let toResponse = await this.dynamoDBQueryAsync(params);
        fromResponse.Items = fromResponse.Items.concat(toResponse.Items);
      }
      fromResponse.Items.sort(function(a, b) {
        // sort object by timestamp
        var dateA = new Date(a.timestamp),
          dateB = new Date(b.timestamp);
        return dateB - dateA; //sort by date ascending
      });
      return fromResponse;
    } catch (error) {
      console.log("HaraBlock@_getTxByAddress", error.message);
      return false;
    }
  };

  async _getVerifiedContractsList(_type = 1, _contractName="hara", _limit = 20) {
    try {
      var params = {
        TableName: this.tblContractName,
        IndexName: "type_contractName",
        ExpressionAttributeNames: {
          "#type": "type",
          "#contractName": "contractName"
        },
        ExpressionAttributeValues: {
          ":type": _type,
          ":contractName": _contractName
        },
        Limit: _limit,
        KeyConditionExpression: "#type = :type AND #contractName = :contractName",
        ScanIndexForward: true
      };

      console.log(params);
      let result = await this.dynamoDBQueryAsync(params);
      if (typeof result === "undefined"){
        return false;
      }
      console.log(result);
      return result;
    } catch (error) {
      console.log("HaraBlock@_getVerifiedContract", error.message);
      return false;
    }
  };

  async _getVerifiedContracts(_type = 1, _contractAddress) {
    try {
      var params = {
        TableName: this.tblContractName,
        Key: {
          type: _type,
          contractAddress: _contractAddress
        },
      };
      let result = await this.dynamoDBGetAsync(params);
      if (typeof result === "undefined"){
        return false;
      }
      return result;
    } catch (error) {
      console.log("HaraBlock@_getVerifiedContract", error.message);
      return false;
    }
  };

  async _insertVerifiedContracts(Item) {
    try {
      var params = {
        TableName: this.tblContractName,
        Item
      };
      let result = await this.dynamoDBPutAsync(params);
      if (typeof result === "undefined"){
        console.log("HaraBlock@_insertVerifiedContracts", result);
        return false;
      }
      return params;
    } catch (error) {
      console.log("HaraBlock@_insertVerifiedContracts", error.message);
      return false;
    }
  };

  /**
   * get detail of tx hash
   * @param {string} txHash
   * @return {object} if fail <boolean> false
   */
  async _getTxData(txHash) {
    let db = new _haraBlock();
    db.type = "transaction";
    db.hash = txHash;

    let result = await new Promise((resolve, reject) => {
      Mapper.get({ item: db })
        .then(val => {
          resolve(val);
        })
        .catch(err => {
          console.log(err);
          resolve(false);
        });
    });

    if (result) {
      return result;
    }

    return false;
  };

  /**
   * get detail of tx hash
   * @param {string} block hash
   * @return {object} if fail <boolean> false
   */
  async _getBlockData(blockNumber) {
    try {
      var params = {
        TableName: this.tblName,
        IndexName: "type_blocknumber",
        ExpressionAttributeNames: {
          "#type": "type",
          "#number": "number"
        },
        ExpressionAttributeValues: {
          ":type": "block",
          ":number": parseInt(blockNumber)
        },
        KeyConditionExpression: "#type = :type AND #number = :number",
        Limit: 1
      };
  
      let result = await this.dynamoDBQueryAsync(params);
  
      if (result) {
        return result.Items;
      }
  
      return false;
      
    } catch (error) {
      console.error("HaraBlock@_getBlockData", error.message);

      return false; 
    }
  };

  /**
   * get last block number from dynamodb
   * @returns {int} if fail {boolean} false
   */
  async _getLastBlockNumber() {
    let db = new _haraBlock();
    db.type = "last_block_number";
    db.hash = "*";

    let result = await new Promise((resolve, reject) => {
      Mapper.get({ item: db })
        .then(val => {
          resolve(val);
        })
        .catch(err => {
          resolve(false);
        });
    });

    if (result && "number" in result) {
      return result.number;
    }

    return false;
  };

  /**
   * get last block number from dynamodb
   * @returns {int} if fail {boolean} false
   */
  async _getTotalTransaction() {
    let db = new _haraBlock();
    db.type = "last_tx_number";
    db.hash = "*";

    let result = await new Promise((resolve, reject) => {
      Mapper.get({ item: db })
        .then(val => {
          resolve(val);
        })
        .catch(err => {
          resolve(false);
        });
    });

    if (result && "number" in result) {
      return result.number;
    }

    return false;
  };
}
