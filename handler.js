"use strict";
import "babel-polyfill";
import {
  _Transactions,
  _DetailTransactions,
  _Web3Functions,
  _TransactionsByAddress,
  _VerifiedContracts,
  _TotalTransaction
} from "./src/WatcherController";

const _getTransactions = async (event, context, callback) => {
  await _Transactions(event, context, callback, "transaction");
};

const _getTransactionsByAddress = async (event, context, callback) => {
  await _TransactionsByAddress(event, context, callback, "transaction");
};

const _getVerifiedContracts = async (event, context, callback) => {
  await _VerifiedContracts(event, context, callback, "transaction");
};

const _getBlocks = async (event, context, callback) => {
  await _Transactions(event, context, callback, "block");
};

const _getDetailTransaction = async (event, context, callback) => {
  await _DetailTransactions(event, context, callback);
};

const _getWeb3Functions = async (event, context, callback) => {
  return _Web3Functions(event, context, callback);
};

const _getTotalTransaction = async (event, context, callback) => {
  await _TotalTransaction(event, context, callback);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "broooh"
    })
  };
};

export {
  _getTransactions,
  _getBlocks,
  _getDetailTransaction,
  _getWeb3Functions,
  _getTransactionsByAddress,
  _getVerifiedContracts,
  _getTotalTransaction
};
