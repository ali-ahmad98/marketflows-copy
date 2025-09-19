import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { useAccount } from 'wagmi';

export const WalletInfo = () => {
  const [walletAddress, setWalletAddress] = useState("");

  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
    } else {
      setWalletAddress("");
    }
  }, [address, isConnected]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Connected Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-mono">
          {walletAddress ? walletAddress : "No wallet connected"}
        </p>
      </CardContent>
    </Card>
  );
};