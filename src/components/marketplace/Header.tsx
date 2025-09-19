import { Button } from "@/components/ui/button";
import { Twitter, Globe, ChevronDown, Wallet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTelegram, faTwitter, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors'

interface HeaderProps {
  connected: boolean;
  account: string | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}

export const Header = () => {
  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="flex justify-between items-center mb-12">
      <h1 className="text-4xl font-bold">Flowstate Marketplace</h1>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors"
          >
            <FontAwesomeIcon icon={faXTwitter} />
          </a>
          <a
            href="https://telegram.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors"
          >
            <FontAwesomeIcon icon={faTelegram} />
          </a>
          <a
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors"
          >
            <Globe className="w-5 h-5" />
          </a>
        </div>
        {isConnected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" size="lg">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                  <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = "/generate"}>
                Workflow Generator [BETA]
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => disconnect()}>
                Disconnect Wallet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={() => connect({ connector: injected() })}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </div>
          </Button>
        )}
      </div>
    </div>
  );
};
