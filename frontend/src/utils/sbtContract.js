import { ethers } from "ethers";
import SBT_ABI from "../abis/InvestorSBT.json";

export const getSBTContract = (signerOrProvider) => {
  console.log("Contract Address:", process.env.NEXT_PUBLIC_SBT_ADDRESS);
  console.log("ABI available:", !!SBT_ABI.abi);
  
  // Create contract with explicit network check
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_SBT_ADDRESS,
    SBT_ABI.abi,
    signerOrProvider
  );
  
  return contract;
};

// Add a function to verify network
export const checkNetwork = async (signer) => {
  try {
    const network = await signer.provider.getNetwork();
    console.log("Connected to network:", network);
    console.log("Chain ID:", network.chainId.toString());
    
    // Avalanche Fuji testnet chain ID is 43113
    const currentChainId = network.chainId.toString();
    const expectedChainId = "43113";
    
    if (currentChainId !== expectedChainId) {
      console.log(`Wrong network. Expected Fuji (${expectedChainId}), got ${currentChainId}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Network check failed:", error);
    return false;
  }
};