import HaraBlock from "./model/HaraBlock";

/**
 * get _Transaction data with type "transaction" and "block"
 * @author allandino pattras
 */
export const _Transactions = async (event, context, callback, type) => {
  let page = 1;
  let limit = 10;
  
  if(event.queryStringParameters && "page" in event.queryStringParameters) {
    page = event.queryStringParameters.page;
  } else {
    callback(null, {
      statusCode: 401,
      body: JSON.stringify({message: "you need page parameter"})
    });
  }

  if(event.queryStringParameters && "limit" in event.queryStringParameters) {
    limit = event.queryStringParameters.limit;
  } else {
    callback(null, {
      statusCode: 401,
      body: JSON.stringify({message: "you need limit parameter"})
    });
  }
  
  let data = await new HaraBlock()._getData(type, page, limit);

  console.log(data["Items"][0].contractAddress);

  callback(null, {
    status: data ? 200 : 401,
    body: JSON.stringify({
      message: data ? "success" : "failed",
      data: data && "Items" in data ? data["Items"] : {}
    })
  });
};

export const _TransactionsByAddress = async (event, context, callback, type = "transaction") => {
  let page = 1;
  let limit = 10;
  let address = typeof event.queryStringParameters.address !== "undefined" ? event.queryStringParameters.address : "0";

  if(!address){
    callback(null, {
      statusCode: 401,
      body: JSON.stringify({message: "you need address parameter"})
    });
  }
  
  if(event.queryStringParameters && "page" in event.queryStringParameters) {
    page = event.queryStringParameters.page;
  } else {
    callback(null, {
      statusCode: 401,
      body: JSON.stringify({message: "you need page parameter"})
    });
  }

  if(event.queryStringParameters && "limit" in event.queryStringParameters) {
    limit = event.queryStringParameters.limit;
  } else {
    callback(null, {
      statusCode: 401,
      body: JSON.stringify({message: "you need limit parameter"})
    });
  }
  
  let data = await new HaraBlock()._queryDataByContractAddress(type, address, page, limit);

  callback(null, {
    status: data ? 200 : 401,
    body: JSON.stringify({
      message: data ? "success" : "failed",
      data: data && "Items" in data ? data["Items"] : {}
    })
  });
};

export const _DetailTransactions = async (event, context, callback) => {
  let txHash = false;

  if(event.queryStringParameters && "txhash" in event.queryStringParameters) {
    txHash = event.queryStringParameters.txhash;
  } else {
    callback(null, {
      statusCode: 401,
      body: JSON.stringify({message: "you need txhash parameter"})
    });
  }

  let data = await new HaraBlock()._getTxData(txHash);

  callback(null, {
    status: data ? 200 : 401,
    body: JSON.stringify({
      message: data ? "success" : "failed",
      data: data ? data : {}
    })
  });
}
