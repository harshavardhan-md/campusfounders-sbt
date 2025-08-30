"use client"; // Important for Next.js App Router

import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function useWallet() {
  const [address, setAddress] = useState(null);
  const [signer, setSigner] = useState(null);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setSigner(signer);
      setAddress(address);
    } else {
      alert("Please install MetaMask!");
    }
  };

  return { address, signer, connectWallet };
}
