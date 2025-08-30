import { ethers } from "ethers";
import SBT_ABI from "../abis/InvestorSBT.json";

export const getSBTContract = (signerOrProvider) => {
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_SBT_ADDRESS,
    SBT_ABI.abi, // use .abi if you copied the full JSON
    signerOrProvider
  );
};
