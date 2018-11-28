import MainNet from "./network/MainNet";
import PrivateNet from "./network/PrivateNet";
import { hartABI } from "./constants/AbiFiles";
import { mainNetContractAddress } from "./constants/Web3Config";
import { privNetContractAddress } from "./constants/Web3Config";
import { authorizationHeader } from "./constants/RequestConfig";
import HaraBlock from "./model/HaraBlock";

import utilHelper from "./helper/utilHelper";

const InputDataDecoder = require('ethereum-input-data-decoder');

/* const winston = require('winston');
const fs = require('fs'); */
const env = process.env.NODE_ENV || 'development';
/* const logDir = 'log';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
} */
/* const tsFormat = () => (new Date()).toLocaleTimeString();
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({
      timestamp: tsFormat,
      colorize: true,
      level: 'info'
    }),
    new (require('winston-daily-rotate-file'))({
      filename: `${logDir}/-results.log`,
      timestamp: tsFormat,
      prepend: true,
      level: env === 'development' ? 'verbose' : 'info'
    })
  ]
}); */

const corsHeader = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true
  }
};

export const _VerifiedContractsByAddress = async (_contractAddress) => {
  let contractAddressTemp  = _contractAddress;
  let contractAddress = contractAddressTemp;
  let type = 1;
  let network = "1-";
  let mustConcat = false;

  if(!contractAddress) {
    return false;
  }
  
  if(contractAddress.search('-') < 1){
    mustConcat = true;
  }

  if(mustConcat){
    contractAddress = network + contractAddressTemp;
  }

  let data = await new HaraBlock()._getVerifiedContracts(type, contractAddress);

  if(typeof data.Item == 'undefined' && mustConcat){
    network = "2-";
    contractAddress = network + contractAddressTemp;
    data = await new HaraBlock()._getVerifiedContracts(type, contractAddress);
  }

  if(typeof data.Item != "undefined"){
    data.Item.abi = JSON.parse(data.Item.abi);
  }

  return {
      data: data && "Item" in data ? data.Item : {}
  };
};

/**
 * get _Transaction data with type "transaction" and "block"
 * @author allandino pattras
 */
export const _Transactions = async (event, context, callback, type, alt = false) => {
  let lastSortKey = false;
  let limit = 10;
  let format = ["transactionHash", "from", "to", "value", "status", "timestamp", "gasLimit", "gasUsed", "gasPrice", "nonce", "input"];

  if (
    event.queryStringParameters &&
    "last_sort_key" in event.queryStringParameters
  ) {
    lastSortKey = event.queryStringParameters.last_sort_key;
  }

  if (event.queryStringParameters && "limit" in event.queryStringParameters) {
    limit = event.queryStringParameters.limit;
  } else {
    callback(null, {
      ...corsHeader,
      statusCode: 401,
      body: JSON.stringify({ message: "you need limit parameter" })
    });
  }

  let data = await new HaraBlock()._getData(type, lastSortKey, limit);
  if(alt && data && "Items" in data){
    let mainNet = new MainNet();
    let tempItems = utilHelper.formatTransactionResponse(data["Items"], format);
    //console.log(tempItems);
    for (let i = 0; i < data.Items.length; ++i){
      if(data.Items[i].to != "*"){
        let verifContract = await _VerifiedContractsByAddress(data.Items[i].to);
        if(typeof verifContract.data != "undefined"){
          let x;
          let temp;
          let res;
          for (x in verifContract.data) {
            let y;
            if( x == data.Items[i].input.substring(0, 10) ){
              const abi = verifContract.data["abi"];
              const decoder = new InputDataDecoder(abi);
              let decodedInput = decoder.decodeData(data.Items[i].input);
              eval("temp = "+Buffer.from(verifContract.data[x], 'base64').toString('ascii'));
              res = temp(decodedInput.inputs);

              let logs = JSON.parse(data.Items[i].logs);
              if(decodedInput.name == 'mintToken'){
                decodedInput.name = 'MintLog';
              }

              let inputsAbi = utilHelper.getArrayObject(abi, "name", decodedInput.name);
              let currentLog;
              let tempLog;
              let logIndex = 0;
              for(let j = 0; j < logs.length; ++j){
                for (y in verifContract.data) {
                  if(logs[j].topics.indexOf(y) >= 0){
                    if(!currentLog || logs[j].data.length >= currentLog.data.length){
                      currentLog = logs[j];
                      logIndex = logs[j].topics.indexOf(y);
                    }
                  }
                }
              }//end inner for

              if(currentLog){
                try{
                  let logRes = await mainNet.web3.eth.abi.decodeLog(
                    inputsAbi.inputs,
                    currentLog.data,
                    /* logs[j].topics.splice(1, logs[j].topics.length) */
                    currentLog.topics
                  );
                  console.log(logRes);
                  eval("tempLog = "+Buffer.from(verifContract.data[currentLog.topics[logIndex]], 'base64').toString('ascii'));
                  let resultLog = tempLog(utilHelper.formatTransactionResponse([logRes])[0]);
                  console.log(resultLog);
                  for (let k = resultLog.length - 1; k >= 0; --k){
                    //console.log(tempItems[i][12]);
                    tempItems[i].splice(1, 0, resultLog[k]);;
                  }//end inner for
                }
                catch(e){console.log(e);}
              }

              for (let j = res.length - 1; j >= 0; --j){
                /* tempItems[i].unshift(res[j]); */
                tempItems[i].splice(1, 0, res[j]);
              }//end inner for
            }
          }
        }
      }
    }//end for
    data.Items = tempItems;
  }//end alt

  callback(null, {
    ...corsHeader,
    statusCode: data ? 200 : 401,
    body: JSON.stringify({
      message: data ? "success" : "failed",
      data: data && "Items" in data ? /* alt ? utilHelper.formatTransactionResponse(data["Items"], format) : */ data["Items"] : {}
    })
  });
};

export const _TransactionsByAddress = async (
  event,
  context,
  callback,
  type = "transaction",
  alt = false
) => {
  let page = 1;
  let limit = 10;
  let address =
    typeof event.queryStringParameters.address !== "undefined"
      ? event.queryStringParameters.address
      : "0";
  
  let format = ["transactionHash", "from", "to", "value", "status", "timestamp", "gasLimit", "gasUsed", "gasPrice", "nonce", "input"];

  if (!address) {
    callback(null, {
      ...corsHeader,
      statusCode: 401,
      body: JSON.stringify({ message: "you need address parameter" })
    });
  }

  if (event.queryStringParameters && "limit" in event.queryStringParameters) {
    limit = event.queryStringParameters.limit;
  } else {
    callback(null, {
      ...corsHeader,
      statusCode: 401,
      body: JSON.stringify({ message: "you need limit parameter" })
    });
  }

  let data = await new HaraBlock()._queryDataByAddress(
    type,
    address,
    page,
    limit
  );

  callback(null, {
    ...corsHeader,
    statusCode: data ? 200 : 401,
    body: JSON.stringify({
      message: data ? "success" : "failed",
      data: data && "Items" in data ? alt ? utilHelper.formatTransactionResponse(data["Items"], format) : data["Items"] : {}
    })
  });
};


export const _VerifiedContractInsert = async (event, context, callback) => {
  if(!event.body){
    callback(null, {
      ...corsHeader,
      statusCode: 400,
      body: JSON.stringify({resultCode: "inc1", resultDesc: "you need request body to call this api"})
    });
  }

  let type = utilHelper.getRequestBody("type", event.body, event.headers["Content-Type"]);
  let contractAddress = utilHelper.getRequestBody("contractAddress", event.body, event.headers["Content-Type"]);
  let networkType = utilHelper.getRequestBody("networkType", event.body, event.headers["Content-Type"]);
  let abi = utilHelper.getRequestBody("abi", event.body, event.headers["Content-Type"]);
  let sourceCode = utilHelper.getRequestBody("sourceCode", event.body, event.headers["Content-Type"]);
  let contractName = utilHelper.getRequestBody("contractName", event.body, event.headers["Content-Type"]);
  let byteCode = utilHelper.getRequestBody("byteCode", event.body, event.headers["Content-Type"]);
  let extras = utilHelper.getRequestBody("params", event.body, event.headers["Content-Type"]);

  if(event.headers.Authorization !== authorizationHeader){
    callback(null, {
      ...corsHeader,
      statusCode: 403,
      body: JSON.stringify({resultCode: "inc2", resultDesc: "unauthorized access"})
    });
    return false;
  }

  let required = "";

  if(!contractAddress){
    required += "contractAddress, "
  }

  if(!abi){
    required += "abi, "
  }

  if(!contractName){
    required += "contractName, "
  }

  if(!sourceCode){
    sourceCode = "*";
  }

  if(!byteCode){
    byteCode += "*";
  }

  if(!type){
    type = 1;
  }
  
  if(!networkType){
    contractAddress = "1-" + contractAddress;
  }else{
    contractAddress = networkType.replace("-", "") + "-" + contractAddress;
  }

  if(extras && utilHelper.isString(extras)){
    extras = JSON.parse(extras);
  }

  if(required){
    required += "needed to call this api";
    callback(null, {
      ...corsHeader,
      statusCode: 400,
      body: JSON.stringify({resultCode: "inc3", resultDesc: required})
    });
    return false;
  }

  let mapperFunctions = "";
  let item = "{";
  for (let i = 0; i < extras.length; ++i) {
    mapperFunctions += `"${extras[i].key}": "${extras[i].value}",`
  }
  let tempItem = `
    "type": ${type},
    "contractAddress": "${contractAddress}",
    "abi": "${abi.replace(/"/g, "\\\"")}",
    "sourceCode": "${sourceCode}",
    "contractName": "${contractName}",
    "byteCode": "${byteCode}"
  `
  item += mapperFunctions + tempItem + "}";
  let data = await new HaraBlock()._insertVerifiedContracts(JSON.parse(item));
  
  if(typeof data.Item != "undefined"){
    data.Item.abi = JSON.parse(data.Item.abi);
  }

  callback(null, {
    ...corsHeader,
    statusCode: data ? 200 : 401,
    body: JSON.stringify({
      resultCode: "0",
      message: data ? "success" : "failed",
      data: data && "Item" in data ? data.Item : {}
    })
  });
  return true;
};

export const _VerifiedContractsList = async (event, context, callback) => {
  let limit;
  let contractName;

  if (event.queryStringParameters && "limit" in event.queryStringParameters) {
    limit = event.queryStringParameters.limit;
  } else {
    callback(null, {
      ...corsHeader,
      statusCode: 401,
      body: JSON.stringify({ message: "you need limit parameter" })
    });
  }

  if (event.queryStringParameters && "contractName" in event.queryStringParameters) {
    contractName = event.queryStringParameters.contractName;
  } else {
    contractName = "hara";
  }

  let data = await new HaraBlock()._getVerifiedContractsList(1, contractName, limit);

  if(typeof data.Items != "undefined"){
    for (let i = 0; i < data.Items.length; ++i){
      data.Items[i].abi = JSON.parse(data.Items[i].abi);
    }
  }

  callback(null, {
    ...corsHeader,
    statusCode: data ? 200 : 401,
    body: JSON.stringify({
      message: data && typeof data.Items != 'undefined' ? "success" : "failed",
      data: data && "Items" in data ? data.Items : {}
    })
  });
  return true;
};

export const _VerifiedContracts = async (event, context, callback) => {
  let contractAddressTemp;
  let contractAddress;
  let type = 1;
  let network = "1-";
  let mustConcat = false;

  if(event.queryStringParameters && "contractAddress" in event.queryStringParameters) {
    contractAddress = event.queryStringParameters.contractAddress;
    contractAddressTemp = contractAddress;
  }else {
    callback(null, {
      ...corsHeader,
      statusCode: 401,
      body: JSON.stringify({message: "you need contract address parameter"})
    });
    return false;
  }
  
  if(contractAddress.search('-') < 1){
    mustConcat = true;
  }

  if(mustConcat){
    contractAddress = network + contractAddressTemp;
  }

  let data = await new HaraBlock()._getVerifiedContracts(type, contractAddress);

  if(typeof data.Item == 'undefined' && mustConcat){
    network = "2-";
    contractAddress = network + contractAddressTemp;
    data = await new HaraBlock()._getVerifiedContracts(type, contractAddress);
  }

  if(typeof data.Item != "undefined"){
    data.Item.abi = JSON.parse(data.Item.abi);
  }

  callback(null, {
    ...corsHeader,
    statusCode: data ? 200 : 401,
    body: JSON.stringify({
      message: data && typeof data.Item != 'undefined' ? "success" : "failed",
      data: data && "Item" in data ? data.Item : {}
    })
  });
  return true;
};

export const _DetailTransaction = async (event, context, callback, alt = false) => {
  let txHash = false;
  let format = ["transactionHash", "from", "to", "value", "status", "timestamp", "gasLimit", "gasUsed", "gasPrice", "nonce", "input"];

  if (event.queryStringParameters && "txhash" in event.queryStringParameters) {
    txHash = event.queryStringParameters.txhash;
  } else {
    callback(null, {
      ...corsHeader,
      statusCode: 401,
      body: JSON.stringify({ message: "you need txhash parameter" })
    });
  }

  let data = await new HaraBlock()._getTxData(txHash);
  if(alt && data){
    let tempItems = utilHelper.formatTransactionResponse([data], format);
      if(data.to != "*"){
        let verifContract = await _VerifiedContractsByAddress(data.to);
        if(typeof verifContract.data != "undefined"){
          let x;
          let temp;
          let res;
          for (x in verifContract.data) {
            if( x == data.input.substring(0, 10) ){
              const abi = verifContract.data["abi"];
              const decoder = new InputDataDecoder(abi);
              let decodedInput = decoder.decodeData(data.input);
              eval("temp = "+Buffer.from(verifContract.data[x], 'base64').toString('ascii'));
              /* if(decodedInput.inputs.length == 2){
                let num = Number("0x" + decodedInput.inputs[1]);
                decodedInput.inputs[1] = num;
              }
              else if(decodedInput.inputs.length == 5){
                let id = Number("0x" + decodedInput.inputs[0]);
                let num = Number("0x" + decodedInput.inputs[2]);
                let addr = Number("0x" + decodedInput.inputs[4]);
                decodedInput.inputs[0] = id;
                decodedInput.inputs[2] = Math.pow(10, -18) * num;
                decodedInput.inputs[4] = addr;
              } */
              res = temp(decodedInput.inputs);
              for (let j = res.length - 1; j >= 0; --j){
                /* tempItems[i].unshift(res[j]); */
                tempItems[0].splice(1, 0, res[j]);
              }//end inner for
            }
          }
        }
      }
    data = tempItems;
  }//end alt

  callback(null, {
    ...corsHeader,
    statusCode: data ? 200 : 401,
    body: JSON.stringify({
      message: data ? "success" : "failed",
      data: data ? alt ? data[0] : data : {}
    })
  });
};

export const _DetailBlock = async (event, context, callback) => {
  let blockNumber = false;
  let format = ["transactionHash", "from", "to", "value", "status", "timestamp", "gasLimit", "gasUsed", "gasPrice", "nonce", "input"];

  if (event.queryStringParameters && "block_number" in event.queryStringParameters) {
    blockNumber = event.queryStringParameters.block_number;
  } else {
    callback(null, {
      ...corsHeader,
      statusCode: 401,
      body: JSON.stringify({ message: "you need block_number parameter" })
    });
  }

  let data = await new HaraBlock()._getBlockData(blockNumber);

  callback(null, {
    ...corsHeader,
    statusCode: data ? 200 : 401,
    body: JSON.stringify({
      message: data ? "success" : "failed",
      data: data ? utilHelper.formatTransactionResponse(data, format) : {}
    })
  });
};

export const _Web3Functions = async (event, context, callback) => {
  let _function = false;
  let _params = [];

  if (
    event.queryStringParameters &&
    "function" in event.queryStringParameters
  ) {
    _function = event.queryStringParameters.function;
  } else {
    callback(null, {
      ...corsHeader,
      statusCode: 401,
      body: JSON.stringify({ message: "you need function parameter" })
    });
  }

  if (event.queryStringParameters && "params" in event.queryStringParameters) {
    _params = event.queryStringParameters.params;
  }

  let data = await new PrivateNet()._web3Alias(_function, _params);

  console.log("data", data);

  callback(null, {
    ...corsHeader,
    statusCode: data ? 200 : 401,
    body: JSON.stringify({
      message: data ? "success" : "failed",
      data: data ? data : {}
    })
  });
};

export const _Web3ContractFunctions = async (event, context, callback) => {
  let _function = false;
  let _params = [];
  let _contractAddress;
  let contractAddressTemp;
  let type = 1;
  let network = "1-";
  let mustConcat = false;

  if(event.queryStringParameters && "contractAddress" in event.queryStringParameters) {
    _contractAddress = event.queryStringParameters.contractAddress;
    contractAddressTemp = _contractAddress;
  }else {
    callback(null, {
      ...corsHeader,
      statusCode: 401,
      body: JSON.stringify({message: "you need contract address parameter"})
    });
    return false;
  }
  
  if(_contractAddress.search('-') < 1){
    mustConcat = true;
  }

  if(mustConcat){
    _contractAddress = network + contractAddressTemp;
  }

  let contractData = await new HaraBlock()._getVerifiedContracts(type, _contractAddress);

  if(typeof contractData.Item == 'undefined' && mustConcat){
    network = "2-";
    _contractAddress = network + contractAddressTemp;
    contractData = await new HaraBlock()._getVerifiedContracts(type, _contractAddress);
  }

  if(typeof contractData.Item != "undefined"){
    contractData.Item.abi = JSON.parse(contractData.Item.abi);
  }else{
    callback(null, {
      ...corsHeader,
      statusCode: 401,
      body: JSON.stringify({message: "contract address not found"})
    });
    return false;
  }

  if(event.queryStringParameters && "function" in event.queryStringParameters) {
    _function = event.queryStringParameters.function;
  } else {
    context.succeed({
      ...corsHeader,
      statusCode: 401,
      body: JSON.stringify({message: "you need function parameter"})
    });
  }

  if(event.queryStringParameters && "contractAddress" in event.queryStringParameters) {
    _contractAddress = event.queryStringParameters.contractAddress;
  } else {
    context.succeed({
      ...corsHeader,
      statusCode: 401,
      body: JSON.stringify({message: "you need contractAddress parameter"})
    });
  }

  if(event.queryStringParameters && "params" in event.queryStringParameters) {
    _params = event.queryStringParameters.params;
  }

  if(!mustConcat){
    _contractAddress = contractAddressTemp.split("-")[1];
  }

  let data = await new PrivateNet()._web3ContractAlias(_contractAddress, contractData.Item.abi, _function, _params);

  context.succeed({
    ...corsHeader,
    statusCode: data ? 200 : 401,
    body: JSON.stringify({
      message: data ? "success" : "failed",
      data: data ? data : {}
    })
  });
}

export const _TotalSupply = async (event, context, callback) => {
  /* let _function = false;
  let _params = [];

  if(event.queryStringParameters && "params" in event.queryStringParameters) {
    _params = event.queryStringParameters.params;
  }  */

  /* logger.debug('Debugging info');
  logger.verbose('Verbose info');
  logger.info('Hello world');
  logger.warn('Warning message');
  logger.error('Error info'); */

  let mainNet = new MainNet();
  let privateNet = new PrivateNet();
  let mainNetHart = await mainNet.haraToken._initHart(hartABI, mainNetContractAddress);
  let privateNetHart = await privateNet.haraToken._initHart(hartABI, privNetContractAddress);
  let data = {};

  let supplyMain = await mainNet.haraToken._getTotalSupply();
  let supplyPrivate = await privateNet.haraToken._getTotalSupply();
  let pending = Math.abs(Number(supplyMain) - Number(supplyPrivate));

  if(supplyMain && supplyPrivate){
    data = {
      supplyMain,
      supplyPrivate,
      pending
    }
  }

  callback(null, {
    ...corsHeader,
    status: data ? 200 : 401,
    body: JSON.stringify({
      message: data ? "success" : "failed",
      data: data ? data : {}
    })
  });
  
}

export const _TotalTransaction = async (event, context, callback) => {
  try {
    let data = await new HaraBlock()._getTotalTransaction();

    console.log("data", data);

    const response = {
      message: data ? "success" : "failed",
      data: data ? data : {}
    };

    callback(null, {
      ...corsHeader,
      statusCode: data ? 200 : 401,
      body: JSON.stringify(response)
    });
  } catch (err) {
    console.error(err.message);
  }
}