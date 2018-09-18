import { TB_HARA_BLOCK, Mapper, InitDB } from "../constants/DbConfig";
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

/**
 * @author allandhino pattras
 */
export default class HaraBlock {
  constructor() {
    this.tblName = TB_HARA_BLOCK;

    this.ddb = InitDB();
    this.dynamoDBQueryAsync = promisify(this.ddb.query).bind(this.ddb);
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
  _getData = async (_type = "block", _page = 1, _limit = 10) => {
    try {
      const lastBlockNumber = await this._getLastBlockNumber();
      const start = lastBlockNumber - (_limit * _page) + 1;
      const end = lastBlockNumber - ((_limit * _page) - _limit);

      var params = {
        TableName: this.tblName,
        IndexName: "type_blocknumber",
        ExpressionAttributeNames: {
          "#type": "type",
          "#number": "number"
        },
        ExpressionAttributeValues: {
          ":type": _type,
          ":start": start, 
          ":end": end
        },
        KeyConditionExpression: "#type = :type AND #number BETWEEN :start AND :end",
        ScanIndexForward: false,
      };
  
      return await this.dynamoDBQueryAsync(params);
    } catch (error) {
      console.log("HaraBlock@_getTx", error.message);
      return false;
    }
  };

  _queryDataByAddress = async (_type = "transaction", _address, _page = 1, _limit = 10) => {
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
        ScanIndexForward: false,
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
        ScanIndexForward: false,
      };
      if(fromResponse.Items.length < _limit){
        let toResponse = await this.dynamoDBQueryAsync(params);
        fromResponse.Items = fromResponse.Items.concat(toResponse.Items);
      }
      fromResponse.Items.sort(function(a, b){ // sort object by timestamp
        var dateA=new Date(a.timestamp), dateB=new Date(b.timestamp)
        return dateB-dateA; //sort by date ascending
      });
      return fromResponse;
    } catch (error) {
      console.log("HaraBlock@_getTxByAddress", error.message);
      return false;
    }
  };

  /* _getContracts = async (_type = "transaction", _page = 1, _limit = 10) => {
    try {
      var params = {
        TableName: this.tblName,
        IndexName: "type_contractAddress",
        ExpressionAttributeNames: {
          "#type": "type",
          "#contractAddress": "contractAddress"
        },
        ExpressionAttributeValues: {
          ":type": _type,
          ":contractAddress": "*"
        },
        Limit: _limit,
        KeyConditionExpression: "#type = :type AND  #contractAddress = :contractAddress",
        ScanIndexForward: false,
      };
      let response = await this.dynamoDBQueryAsync(params);
      return response;
    } catch (error) {
      console.log("HaraBlock@_getTxByAddress", error.message);
      return false;
    }
  }; */

  /**
   * get detail of tx hash
   * @param {string} txHash 
   * @return {object} if fail <boolean> false
   */
  _getTxData = async txHash => {
    let db = new _haraBlock();
    db.type = "transaction";
    db.hash = txHash;

    let result = await new Promise((resolve, reject) => {
      Mapper.get({ item: db })
        .then(val => {
          resolve(val);
        })
        .catch(err => {
          resolve(false);
        });
    });

    console.log(result);

    if (result) {
      return result;
    }

    return false;
  };
  
  /**
   * get last block number from dynamodb
   * @returns {int} if fail {boolean} false
   */
  _getLastBlockNumber = async () => {
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
  }

  /**
   * get last block number from dynamodb
   * @returns {int} if fail {boolean} false
   */
  _getTotalTransaction = async () => {
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
  }
}
