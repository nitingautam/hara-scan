import { hartABI } from "../constants/AbiFiles";
import { mainWeb3 } from "../constants/Web3Config";
import HaraToken from "../contract/HaraToken";

export default class MainNet {
  constructor() {
    this.web3 = mainWeb3;
    this.haraToken = new HaraToken(this.web3, hartABI);
  }

  async _web3Alias(functionName, params) {
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
      console.warn("Mainnet@_web3Alias params", error.message);
    }

    try {
      if (allParams.length != 0) {
        functionName = "this.web3.eth." + functionName + "(" + allParams + ")";
      } else {
        functionName = "this.web3.eth." + functionName;
      }

      console.log(functionName);

      let data = await eval(functionName);

      return data;
    } catch (error) {
      return error.message;
    }
  };

  async _web3ContractAlias(contractAddress, abi, functionName, params) {
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
      console.warn("Mainnet@_web3Contract_params", error.message);
    }
    
    let contract = await new mainWeb3.eth.Contract(abi, contractAddress);

    try {
      if (allParams.length != 0) {
        functionName = "contract.methods." + functionName + "(" +allParams+ ").call()";
        console.log(functionName);
      } else {
        functionName = "contract.methods." + functionName + "().call()";
      }

      let data = await eval(functionName);

      return data;
    } catch (error) {
      return error.message;
    }
  };

}
