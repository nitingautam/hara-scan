import PrivateNet from "./network/PrivateNet";

export const _BlockWatcher = async () => {
  const privNet = await new PrivateNet();
  
  privNet._listenNewBlockHeader();
  privNet._listenPendingBlock();
};
