import { privWeb3 } from "../constants/Web3Config";

export default class PrivateNet {
  constructor() {
    this.web3 = privWeb3;
  }

  _web3Alias = async (functionName, params) => {
    let allParams = '';

    try {
      if(params.length > 0) {
        params = JSON.parse(params);
  
        params.map((val, key) => {
          if (key == params.length - 1) {
            allParams = allParams + '"' + val + '"';
          } else {
            allParams = allParams + '"' + val + '",';
          }
        });
      }
    } catch (error) {
      console.warn("Privatenet@_web3Alias params", error.message);
    }

    try {
      if (allParams.length != 0) {
        functionName = "this.web3.eth." + functionName + "(" + allParams + ")";
      } else {
        functionName = "this.web3.eth." + functionName;
      }

      let data = await eval(functionName);

      return data;
    } catch (error) {
      return error.message;
    }
  };
}
