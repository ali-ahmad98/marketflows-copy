import { Button } from "@/components/ui/button";
import { Twitter, Globe, ChevronDown, Wallet, X, Send } from "lucide-react";
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
    <div className="flex justify-between items-center mb-12 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-gray-900 border-t-transparent animate-spin"></div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50"
          >
            <X className="w-5 h-5" />
          </a>
          <a
            href="https://telegram.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50"
          >
            <Send className="w-5 h-5" />
          </a>
          <a
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50"
          >
            <Globe className="w-5 h-5" />
          </a>
        </div>
        {isConnected ? (
          <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-mono text-gray-300">
              {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-gray-800 border-gray-700">
                <DropdownMenuItem onClick={() => window.location.href = "/dashboard"} className="text-gray-300 hover:text-white hover:bg-gray-700">
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = "/generate"} className="text-gray-300 hover:text-white hover:bg-gray-700">
                  Workflow Generator [BETA]
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => disconnect()} className="text-gray-300 hover:text-white hover:bg-gray-700">
                  Disconnect Wallet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button
            onClick={() => connect({ connector: injected() })}
            className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-white"
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
