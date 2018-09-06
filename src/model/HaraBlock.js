import { TB_HARA_BLOCK, InitDB, Mapper } from "../constants/DbConfig";
import { DynamoDbSchema, DynamoDbTable } from "@aws/dynamodb-data-mapper";

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
      status: { type: "String" }
    }
  }
});

export default class HaraBlock {
  constructor() {
    this.tblName = TB_HARA_BLOCK;
  }

  _insertBlock = (data, blockStatus = "pending") => {
    return new Promise((resolve, reject) => {
      if ("hash" in data) {
        const db = new _haraBlock();
        let _item = Object.assign(db, data);
        _item.blockStatus = blockStatus;
        _item.type = "block";
        _item.timestamp = new Date(_item.timestamp * 1000).toISOString();
        _item.transactionsCount = _item.transactions.length;
        _item.transactions = JSON.stringify(_item.transactions);

        Mapper.put({ item: _item })
          .then(() => {
            resolve({
              status: 1,
              data: _item,
              message: "Item with Hash " + _item.hash + " successfull saved"
            });
          })
          .catch(err => {
            console.warn(err.message);
            resolve({
              status: 0,
              data: _item,
              message: "Item with Hash " + _item.hash + " failed saved"
            });
          });
      } else {
        resolve({
          status: 0,
          message: "there is no hash inside your data"
        });
      }
    });
  };

  _insertTransaction = data => {
    return new Promise((resolve, reject) => {
      if ("transactionHash" in data) {
        const db = new _haraBlock();
        let _item = Object.assign(db, data);
        _item.type = "transactions";
        _item.hash = _item.transactionHash;
        _item.timestamp = new Date().toISOString();

        if (_item.logs.length == 0) {
          _item.transactionType = "user_to_user";
        } else if (_item.logs.length == 1) {
          _item.transactionType = "contract_creation";
        } else {
          _item.transactionType = "user_to_contract";
        }

        _item.logs = JSON.stringify(_item.logs);
        _item.status = _item.status ? "true" : "false";
        _item.contractAddress = _item.contractAddress
          ? _item.contractAddress.toString()
          : "*";
        _item.number = _item.blockNumber;

        Mapper.put({ item: _item })
          .then(() => {
            resolve({
              status: 1,
              data: _item,
              message:
                "Item with transaction Hash " +
                _item.hash +
                " successfull saved"
            });
          })
          .catch(err => {
            console.warn(err.message);
            resolve({
              status: 0,
              data: _item,
              message:
                "Item with transaction Hash " + _item.hash + " failed saved"
            });
          });
      } else {
        resolve({
          status: 0,
          message: "there is no transaction Hash inside your data"
        });
      }
    });
  };

  _insertPendingTransaction = txHash => {
    return new Promise((resolve, reject) => {
      let db = new _haraBlock();
      db.type = "transactions";
      db.hash = txHash;
      db.status = "pending";

      Mapper.put({ item: db })
        .then(() => {
          resolve({
            status: 1,
            data: db,
            message: "Item with transaction Hash " + db.hash + " is Pending"
          });
        })
        .catch(err => {
          console.warn(err.message);
          resolve({
            status: 0,
            data: db,
            message:
              "Item with transaction Hash " +
              db.hash +
              " is pending failed to saved"
          });
        });
    });
  };

  _getTxData = async txHash => {
    let db = new _haraBlock();
    db.type = "transactions";
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

    if (result) {
      return result;
    }

    return false;
  };
}
