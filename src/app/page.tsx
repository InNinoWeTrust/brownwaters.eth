"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  getContract,
  readContract,
  prepareContractCall,
  sendTransaction,
  defineChain,
  createThirdwebClient,
} from "thirdweb";
import { polygon } from "thirdweb/chains";
import {
  ConnectButton,
  useActiveAccount,
  NFTProvider,
  NFTMedia,
  NFTName,
  NFTDescription,
  TokenProvider,
  TokenIcon,
  TokenName,
  ClaimButton,
} from "thirdweb/react";
import thirdwebIcon from "@public/brownwatersproductionsComplete.png";
import { client } from "./client";
import VoteContractABI from "@/VoteContractABI.json";
import BWPContractABI from "@/BWPContractABI.json";
import MembershipABI from "@/MembershipABI.json";

// Initialize contracts
const voteContract = getContract({
  address: "0x5f4BaBb0BEe57414142E570326449a7ff6d42685",
  chain: polygon,
  client: client,
  abi: VoteContractABI,
});

const nftContract = getContract({
  address: "0xE90D7479933E3CA7f4cC0D7A3be362008baa9f59",
  chain: polygon,
  client: client,
  abi: MembershipABI,
});

const tokenContract = getContract({
  address: "0x34d63a572194F61e53b16A97Dda2fE82BF4C7e4d",
  chain: polygon,
  client: client,
  abi: BWPContractABI,
});

// Fixed resources array
const resources = [
  {
    title: "Brown Waters Productions Discord",
    href: "https://discord.gg/qETmz5MpQ3",
    description: "Join the Brown Waters Productions Discord community.",
  },
  {
    title: "Brown Waters Productions Twitter",
    href: "https://twitter.com/brownwatersdao",
    description: "Follow Brown Waters Productions on Twitter.",
  },
  {
    title: "Brown Waters Productions Intern Program",
    href: "https://forms.gle/snCKcCANC8UcDC6U6",
    description: "Brown Waters Productions Intern Program Application.",
  },
  {
    title: "Brown Waters Productions Booking Page",
    href: "http://brownwatersproductions.square.site/",
    description: "Brown Waters Productions Booking Page",
  },
  {
    title: "Brown Waters Productions Linktree",
    href: "https://linktr.ee/brownwatersdao",
    description: "Subscribe to the Brown Waters Productions Linktree.",
  },
  {
    title: "Brown Waters Productions Token Lightpaper",
    href: "https://bafybeiceopiyd4pp3nbdyzdklpymehtyzzlgpgwwr4non7hxlmf7ayh7sq.ipfs.dweb.link?filename=Brown%20Waters%20Productions%20DAO%20(%24BWP)%20Light%20Paper.pdf",
    description: "$BWP Token Lightpaper",
  },
];

function ResourceCard({ title, href, description }: { title: string; href: string; description: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col border border-[#201c1a] p-4 rounded-lg hover:bg-[#2d2927] transition-colors hover:border-[#3a3533]"
      aria-label={title}
    >
      <article>
        <h2 className="text-lg font-semibold mb-2 text-orange-500">{title}</h2>
        <p className="text-sm text-gray-400">{description}</p>
      </article>
    </a>
  );
}

function ResourcesSection() {
  return (
    <div className="grid gap-4 lg:grid-cols-3 justify-center mt-8">
      {resources.map((resource) => (
        <ResourceCard key={resource.href} {...resource} />
      ))}
    </div>
  );
}

export default function Home() {
  const activeAccount = useActiveAccount();
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [proposals, setProposals] = useState<any[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [proposalDescription, setProposalDescription] = useState("");
  const [hasToken, setHasToken] = useState(false);
  const [hasNFT, setHasNFT] = useState(false);
  const activeAddress = activeAccount?.address;

  // Set the chain definition for thirdweb
  defineChain(polygon);

  const checkAssetBalances = useCallback(async () => {
    if (!activeAddress) return;
    try {
      const tokenBalance = await readContract({
        contract: tokenContract,
        method: "function balanceOf(address account) view returns (uint256)",
        params: [activeAddress],
      });
      setHasToken(BigInt(tokenBalance.toString()) > 0n);

      const nftBalance = await readContract({
        contract: nftContract,
        method: "function balanceOf(address account, uint256 id) view returns (uint256)",
        params: [activeAddress, 0n],
      });
      setHasNFT(BigInt(nftBalance.toString()) > 0n);
    } catch (error) {
      console.error("Error checking asset balances:", error);
    }
  }, [activeAddress]);

  const fetchProposals = useCallback(async () => {
    setLoadingProposals(true);
    try {
      const data = await readContract({
        contract: voteContract,
        method:
          "function getAllProposals() view returns ((uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)[] allProposals)",
        params: [],
      });
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const sanitizedProposals = data.map((proposal: any) => ({
        id: proposal.proposalId.toString(),
        proposer: proposal.proposer,
        description: proposal.description || "No description available",
        startBlock: proposal.startBlock,
        endBlock: proposal.endBlock,
      }));
      setProposals(sanitizedProposals);
      setFetchError(null);
    } catch (error) {
      setFetchError("Failed to fetch proposals. Please check your contract.");
      console.error("Error fetching proposals:", error);
    } finally {
      setLoadingProposals(false);
    }
  }, []);

  useEffect(() => {
    if (activeAddress) {
      checkAssetBalances();
      fetchProposals();
    }
  }, [activeAddress, checkAssetBalances, fetchProposals]);

  // Handle vote actions
  const handleVote = async (proposalId: string, voteType: number) => {
    try {
      const transaction = await prepareContractCall({
        contract: voteContract,
        method: "function castVote(uint256 proposalId, uint8 support) returns (uint256)",
        params: [proposalId, voteType],
      });

      const { transactionHash } = await sendTransaction({ account: activeAccount, transaction });
      setFetchError(null);
      console.log(`Transaction hash: ${transactionHash}`);
      console.log(`Vote submitted for proposal ${proposalId}, type: ${voteType}`);
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };

  // Handle proposal submission
  const handlePropose = async () => {
    if (!proposalDescription.trim()) {
      console.error("Proposal description is empty");
      return;
    }
    try {
      // To avoid "Governor: empty proposal", supply at least one target, value, and calldata.
      const targets: string[] = [voteContract.address];
      const values: number[] = [0];
      const calldatas: string[] = [activeAddress]; // Use the actual active address if needed
      const description = proposalDescription;

      const transaction = await prepareContractCall({
        contract: voteContract,
        method:
          "function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256 proposalId)",
        params: [targets, values, calldatas, description],
      });
      await sendTransaction({ account: activeAccount, transaction });
      setFetchError(null);
      console.log(`Proposal submitted: ${proposalDescription}`);
      setProposalDescription("");
      fetchProposals();
    } catch (error) {
      console.error("Error submitting proposal:", error);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f3ef] flex flex-col items-center justify-center container mx-auto">
      <header className="w-full flex justify-between items-center p-6 bg-[#201c1a] shadow-md border-b border-white-300">
        <div className="flex items-center space-x-4">
          <Image src={thirdwebIcon} alt="Brown Waters Productions" width={100} height={100} />
          <h1 className="text-2xl font-bold text-orange-500">Brown Waters DAO</h1>
        </div>
        <NFTProvider contract={nftContract} tokenId={0n}>
          <div className="flex flex-col items-center">
            <NFTMedia className="w-16 h-16 rounded-full border border-orange-500" />
            <NFTName className="text-sm font-medium mt-2 text-white" />
            <NFTDescription className="text-xs text-gray-400" />
          </div>
        </NFTProvider>
        <ConnectButton client={client} />
      </header>

      {activeAddress ? (
        <section className="mt-8 space-y-6 w-full max-w-4xl px-4">
          <h2 className="text-lg font-semibold text-[#201c1a]">
            Welcome, <span className="text-orange-500">{activeAddress}</span>
          </h2>
          {(hasToken || hasNFT) ? (
            <>
              <TokenSection />
              <VoteSection
                proposals={proposals}
                fetchError={fetchError}
                loadingProposals={loadingProposals}
                handleVote={handleVote}
              />
              {/* Proposal Form Section */}
              <div className="bg-black shadow-lg p-6 rounded-lg mt-4">
                <h2 className="text-lg font-bold text-white">Propose a New Proposal</h2>
                <textarea
                  value={proposalDescription}
                  onChange={(e) => setProposalDescription(e.target.value)}
                  className="w-full p-2 rounded mt-2 bg-gray-800 text-white"
                  placeholder="Enter proposal description..."
                />
                <button
                  type="button"
                  onClick={handlePropose}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Submit Proposal
                </button>
              </div>
            </>
          ) : (
            <p className="text-red-500">
              You must hold a token or NFT to propose or vote.
            </p>
          )}

          <MintSection />
        </section>
      ) : (
        <section className="mt-16 flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold text-[#201c1a] mb-4">Welcome to Brown Waters DAO</h1>
          <p className="text-gray-600 mb-6">
            Connect your wallet to participate in DAO activities and access exclusive content.
          </p>
          <ConnectButton client={client} />
        </section>
      )}
      {/* Resources section is always visible */}
      <ResourcesSection />
    </main>
  );
}

interface VoteSectionProps {
  proposals: any[];
  fetchError: string | null;
  loadingProposals: boolean;
  handleVote: (proposalId: string, voteType: number) => void;
}

function VoteSection({ proposals, fetchError, loadingProposals, handleVote }: VoteSectionProps) {
  return (
    <div className="bg-black shadow-lg p-6 rounded-lg border-t-4 border-orange-500">
      <h2 className="text-lg font-bold text-white">Proposals</h2>
      {fetchError ? (
        <p className="text-red-500 mt-4">{fetchError}</p>
      ) : loadingProposals ? (
        <p className="text-gray-600 mt-4">Loading proposals...</p>
      ) : proposals.length > 0 ? (
        proposals.map((proposal) => (
          <div key={proposal.id} className="border-t pt-4 mt-4">
            <p>
              <strong>ID:</strong> {proposal.id}
            </p>
            <p>
              <strong>Proposer:</strong> {proposal.proposer}
            </p>
            <p>
              <strong>Description:</strong> {proposal.description}
            </p>
            <div className="flex space-x-4 mt-2">
              <button
                type="button"
                onClick={() => handleVote(proposal.id, 1)}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-green-600"
              >
                Vote For
              </button>
              <button
                type="button"
                onClick={() => handleVote(proposal.id, 0)}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-red-700"
              >
                Vote Against
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600 mt-4">No active proposals available.</p>
      )}
    </div>
  );
}

function TokenSection() {
  return (
    <div className="bg-black shadow-lg p-6 rounded-lg mt-6 border-t-4 border-black">
      <TokenProvider address="0x34d63a572194F61e53b16A97Dda2fE82BF4C7e4d" client={client} chain={polygon}>
        <div className="flex items-center space-x-2">
          <TokenIcon className="w-8 h-8" />
          <TokenName className="text-xl font-bold text-white-700" />
        </div>
      </TokenProvider>
    </div>
  );
}

function MintSection() {
  return (
    <div className="bg-black shadow-lg p-6 rounded-lg border-t-4 border-green-600">
      <h2 className="text-lg font-bold text-white">Mint Options</h2>
      <div className="flex space-x-4 mt-4">
        <ClaimButton
          contractAddress="0x34d63a572194F61e53b16A97Dda2fE82BF4C7e4d"
          chain={polygon}
          client={client}
          claimParams={{
            type: "ERC20",
            quantity: "1000",
          }}
        >
          Claim $BWP
        </ClaimButton>
        <ClaimButton
          contractAddress="0xE90D7479933E3CA7f4cC0D7A3be362008baa9f59"
          chain={polygon}
          client={client}
          claimParams={{
            type: "ERC1155",
            quantity: 1n,
            tokenId: 0n,
          }}
        >
          Claim NFT
        </ClaimButton>
      </div>
    </div>
  );
}

// Example React component snippet for Nebula Chat integration
import { sendNebulaChat } from "./services/nebulaChatService";

function ChatComponent() {
  const [userMessage, setUserMessage] = useState("");
  const [chatResponse, setChatResponse] = useState("");

  const handleSend = async () => {
    const result = await sendNebulaChat(userMessage);
    if (result) {
      // Assuming the API returns a 'messages' array with the assistant's reply at the end
      const assistantReply = result.messages[result.messages.length - 1].text;
      setChatResponse(assistantReply);
    }
  };

  return (
    <div>
      <textarea
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        placeholder="How may I assist you today?"
      />
      <button type="button" onClick={handleSend}>Send</button>
      <div>
        <strong>Assistant:</strong>
        <p>{chatResponse}</p>
      </div>
    </div>
  );
}

export { ChatComponent };
