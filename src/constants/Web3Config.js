import Web3 from "web3";

export const privProvider =
  process.env.PRIV_NETWORK !== "undefined" && process.env.PRIV_NETWORK
    ? process.env.PRIV_NETWORK
    : "http://localhost:8546";

export const mainProvider =
    process.env.MAIN_NETWORK !== "undefined" && process.env.MAIN_NETWORK
      ? process.env.MAIN_NETWORK
      : "http://localhost:8545";
    
export const privWeb3 = new Web3(
  new Web3.providers.HttpProvider(privProvider)
);

export const mainWeb3 = new Web3(
  new Web3.providers.WebsocketProvider(mainProvider)
);

export const mainNetAccount = process.env.MAIN_NETWORK_ACCOUNT ? process.env.MAIN_NETWORK_ACCOUNT : "0x2A4FEB48B3bC241C4bD3b7A9B420683deB572A58";
export const privNetAccount = process.env.PRIV_NETWORK_ACCOUNT ? process.env.PRIV_NETWORK_ACCOUNT : "0x2A4FEB48B3bC241C4bD3b7A9B420683deB572A58";

export const mainNetContractAddress = process.env.HART_MAIN_ADDRESS ? process.env.HART_MAIN_ADDRESS : "0x550fa4cdda2c7a8df15353130fe1bec93b1d5a8f";
export const privNetContractAddress = process.env.HART_PRIV_ADDRESS ? process.env.HART_PRIV_ADDRESS : "0x2bc5ef27365e5e057cf1882bb22082665d33a79c";
