import { _Transactions, _DetailTransactions, _TransactionsByAddress } from "./src/WatcherController";

'use strict';

const _getTransactions = async (event, context, callback) => {
  await _Transactions(event, context, callback, "transaction");
};

const _getTransactionsByAddress = async (event, context, callback) => {
  await _TransactionsByAddress(event, context, callback, "transaction");
};

const _getBlocks = async (event, context, callback) => {
  await _Transactions(event, context, callback, "block");
};

const _getDetailTransaction = async (event, context, callback) => {
  await _DetailTransactions(event, context, callback);
};


export {
  _getTransactions,
  _getBlocks,
  _getDetailTransaction,
  _getTransactionsByAddress
}