"use client";

import { useEffect, useState } from "react";
import useWallet from "../hooks/useWallet";
import { getSBTContract } from "../utils/sbtContract";

export default function Home() {
  const { address, connectWallet, signer } = useWallet();
  const [hasSBT, setHasSBT] = useState(false);
  const [tokenId, setTokenId] = useState(null);
  const [tokenURI, setTokenURI] = useState("");

  const checkSBT = async () => {
    if (!signer || !address) return;

    const sbt = getSBTContract(signer);
    try {
      const id = await sbt.tokenOf(address);
      if (id.toString() !== "0") {
        setHasSBT(true);
        setTokenId(id.toString());
        const uri = await sbt.tokenURI(id);
        setTokenURI(uri);
      }
    } catch (e) {
      console.log("No SBT found:", e);
    }
  };

  useEffect(() => {
    checkSBT();
  }, [signer, address]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>CampusFounders Investor Verification</h1>
      {!address && <button onClick={connectWallet}>Connect Wallet</button>}
      {address && <p>Wallet: {address}</p>}

      {hasSBT ? (
        <div>
          <h2>✅ Verified Investor!</h2>
          <p>Token ID: {tokenId}</p>
          <p>Metadata URI: {tokenURI}</p>
        </div>
      ) : (
        address && <p>❌ You don’t have a verified investor SBT yet.</p>
      )}
    </div>
  );
}
