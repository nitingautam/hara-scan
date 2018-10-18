export default class HaraToken {
    constructor(web3Node, abi) {
      this.web3 = web3Node;
      this.hart = new this.web3.eth.Contract(abi);
      this.abi = abi;
    }
  
    // you need trigger this after deploy or reading a contract
    async _initHart(abi, contract_address){
      this.hart = await new this.web3.eth.Contract(abi, contract_address);
      this.hart_address = contract_address;
      return this.hart;
    };
  
    async _getTotalSupply() {
        let balance =  await this.hart.methods.totalSupply().call();
        return balance;
        //return parseInt(this.web3.utils.fromWei(balance.toString(), "ether" ));
    }
  }
  