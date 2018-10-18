import {
  _Transactions,
  _DetailTransaction,
  _Web3Functions,
  _Web3ContractFunctions,
  _TransactionsByAddress,
  _VerifiedContracts,
  _VerifiedContractsList,
  _VerifiedContractInsert,
  _TotalTransaction,
  _TotalSupply,
  _DetailBlock
} from "./src/WatcherController";

const _getTransactions = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await _Transactions(event, context, callback, "transaction", false);
};

const _getTransactionsAlt = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await _Transactions(event, context, callback, "transaction", true);
};

const _getTransactionsByAddress = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await _TransactionsByAddress(event, context, callback, "transaction", false);
};

const _getTransactionsByAddressAlt = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await _TransactionsByAddress(event, context, callback, "transaction", true);
};

const _getVerifiedContracts = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await _VerifiedContracts(event, context, callback, "transaction");
};

const _getVerifiedContractsList = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await _VerifiedContractsList(event, context, callback, "transaction");
};

const _insertVerifiedContracts = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await _VerifiedContractInsert(event, context, callback, "transaction");
};

const _getBlocks = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await _Transactions(event, context, callback, "block", false);
};

const _getBlocksAlt = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await _Transactions(event, context, callback, "block", true);
};

const _getDetailTransaction = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await _DetailTransaction(event, context, callback, false);
};

const _getDetailTransactionAlt = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await _DetailTransaction(event, context, callback, true);
};

const _getDetailBlock = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await _DetailBlock(event, context, callback);
};

const _getWeb3Functions = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return _Web3Functions(event, context, callback);
};

const _getWeb3ContractFunctions = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return _Web3ContractFunctions(event, context, callback);
};

const _getTotalSupply = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await _TotalSupply(event, context, callback);
}

const _getTotalTransaction = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await _TotalTransaction(event, context, callback);
};

export {
  _getTransactions,
  _getTransactionsAlt,
  _getBlocks,
  _getBlocksAlt,
  _getDetailTransaction,
  _getDetailTransactionAlt,
  _getWeb3Functions,
  _getWeb3ContractFunctions,
  _getTransactionsByAddress,
  _getTransactionsByAddressAlt,
  _getVerifiedContracts,
  _getVerifiedContractsList,
  _insertVerifiedContracts,
  _getTotalSupply,
  _getTotalTransaction,
  _getDetailBlock
};
