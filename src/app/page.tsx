"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  getContract,
  readContract,
  prepareContractCall,
  sendTransaction,
  defineChain,
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
import { sendNebulaChat } from "./services/nebulaChatService";
import Tooltip from "@/app/components/Tooltip";
import OnboardingModal from "@/app/components/OnboardingModal";

// Fixed resources array (localized as needed)
const resources = [
  {
    title: "Brown Waters Productions Token Lightpaper",
    href: "https://bafybeiceopiyd4pp3nbdyzdklpymehtyzzlgpgwwr4non7hxlmf7ayh7sq.ipfs.dweb.link?filename=Brown%20Waters%20Productions%20DAO%20(%24BWP)%20Light%20Paper.pdf",
    description: "$BWP Token Lightpaper",
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
    title: "Brown Waters Productions Discord",
    href: "https://discord.gg/qETmz5MpQ3",
    description: "Join the Brown Waters Productions Discord community.",
  },
];

interface ResourceCardProps {
  title: string;
  href: string;
  description: string;
}

function ResourceCard({ title, href, description }: ResourceCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col border border-[#201c1a] p-4 rounded-lg hover:bg-[yellow] transition-colors hover:border-[#3a3533]"
      aria-label={title}
    >
      <article>
        <h2 className="text-lg font-semibold mb-2 text-black">{title}</h2>
        <p className="text-sm text-gray-700">{description}</p>
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

// Updated ChatComponent with response checking and debugging logs
function ChatComponent() {
  const { t } = useTranslation("common");
  const [userMessage, setUserMessage] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const result = await sendNebulaChat(userMessage);
      console.log("Nebula chat API result:", result);
      if (result?.messages && result.messages.length > 0) {
        const assistantReply =
          result.messages[result.messages.length - 1].text || "";
        setChatResponse(assistantReply);
        console.log("Assistant reply from messages array:", assistantReply);
      } else if (result?.message) {
        setChatResponse(result.message);
        console.log("Assistant reply from message field:", result.message);
      } else {
        console.warn("No messages in result", result);
        setChatResponse("No reply received from AI Assistant.");
      }
    } catch (error) {
      console.error("Error in handleSend:", error);
      setChatResponse("Error sending message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <textarea
        id="chat-input"
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        placeholder={t("chat.placeholder", "How may I assist you today?")}
        className="p-2 border rounded"
        aria-label={t("chat.placeholder", "How may I assist you today?")}
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Sending..." : t("chat.send", "Send")}
      </button>
      {chatResponse && (
        <div className="mt-2 p-2 border rounded bg-gray-900 text-gray-100">
          <strong>{t("chat.assistant", "AI Assistant:")}</strong>
          <p>{chatResponse}</p>
        </div>
      )}
    </div>
  );
}

// ProposalForm component: container for proposing a new proposal
interface ProposalFormProps {
  proposalDescription: string;
  setProposalDescription: (desc: string) => void;
  handlePropose: () => void;
  t: (key: string, fallback?: string) => string;
}

function ProposalForm({ proposalDescription, setProposalDescription, handlePropose, t }: ProposalFormProps) {
  return (
    <div className="bg-black shadow-lg p-6 rounded-lg mt-4">
      <h2 className="text-lg font-bold text-white">
        {t("proposalForm.title", "Propose a New Proposal")}
      </h2>
      <label htmlFor="proposal-description" className="sr-only">
        {t("proposalForm.placeholder", "Enter proposal description...")}
      </label>
      <textarea
        id="proposal-description"
        value={proposalDescription}
        onChange={(e) => setProposalDescription(e.target.value)}
        className="w-full p-2 rounded mt-2 bg-gray-800 text-white"
        placeholder={t("proposalForm.placeholder", "Enter proposal description...")}
      />
      <button
        type="button"
        onClick={handlePropose}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {t("proposalForm.submit", "Submit Proposal")}
      </button>
    </div>
  );
}

// Main Home component
export default function Home() {
  const { t } = useTranslation("common");
  const activeAccount = useActiveAccount();
  const activeAddress = activeAccount?.address;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [proposals, setProposals] = useState<any[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [proposalDescription, setProposalDescription] = useState("");
  const [hasToken, setHasToken] = useState(false);
  const [hasNFT, setHasNFT] = useState(false);
  // State for onboarding modal display
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Set the chain definition for thirdweb
  defineChain(polygon);

  // Contracts state; contracts are loaded dynamically when a wallet is connected
  const [contracts, setContracts] = useState<{
    voteContract: any;
    nftContract: any;
    tokenContract: any;
  } | null>(null);

  useEffect(() => {
    if (activeAddress) {
      Promise.all([
        import("@/VoteContractABI.json"),
        import("@/BWPContractABI.json"),
        import("@/MembershipABI.json"),
      ])
        .then(([voteABI, bwpABI, membershipABI]) => {
          const voteContract = getContract({
            address: "0x5f4BaBb0BEe57414142E570326449a7ff6d42685",
            chain: polygon,
            client: client,
            abi: voteABI as unknown as any[],
          });
          const nftContract = getContract({
            address: "0xE90D7479933E3CA7f4cC0D7A3be362008baa9f59",
            chain: polygon,
            client: client,
            abi: membershipABI as unknown as any[],
          });
          const tokenContract = getContract({
            address: "0x34d63a572194F61e53b16A97Dda2fE82BF4C7e4d",
            chain: polygon,
            client: client,
            abi: bwpABI as unknown as any[],
          });
          setContracts({ voteContract, nftContract, tokenContract });
        })
        .catch((error) => {
          console.error("Error loading contract ABIs", error);
        });
    }
  }, [activeAddress]);

  const checkAssetBalances = useCallback(async () => {
    if (!activeAddress || !contracts) return;
    try {
      const tokenBalance = await readContract({
        contract: contracts.tokenContract,
        method: "function balanceOf(address account) view returns (uint256)",
        params: [activeAddress],
      });
      setHasToken(BigInt(tokenBalance.toString()) > 0n);

      const nftBalance = await readContract({
        contract: contracts.nftContract,
        method: "function balanceOf(address account, uint256 id) view returns (uint256)",
        params: [activeAddress, 0n],
      });
      setHasNFT(BigInt(nftBalance.toString()) > 0n);
    } catch (error) {
      console.error("Error checking asset balances:", error);
    }
  }, [activeAddress, contracts]);

  const fetchProposals = useCallback(async () => {
    if (!contracts) return;
    setLoadingProposals(true);
    try {
      const data = await readContract({
        contract: contracts.voteContract,
        method:
          "function getAllProposals() view returns ((uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)[] allProposals)",
        params: [],
      });
      const sanitizedProposals = data.map((proposal: any) => ({
        id: proposal.proposalId.toString(),
        proposer: proposal.proposer,
        description:
          proposal.description ||
          t("voteSection.noDescription", "No description available"),
        startBlock: Number(proposal.startBlock),
        endBlock: Number(proposal.endBlock),
      }));
      // Removed provider-based filtering.
      setProposals(sanitizedProposals);
      setFetchError(null);
    } catch (error) {
      setFetchError(
        t("errors.fetchProposals", "Failed to fetch proposals. Please check your contract.")
      );
      console.error("Error fetching proposals:", error);
    } finally {
      setLoadingProposals(false);
    }
  }, [t, contracts]);

  useEffect(() => {
    if (activeAddress && contracts) {
      checkAssetBalances();
      fetchProposals();
    }
  }, [activeAddress, contracts, checkAssetBalances, fetchProposals]);

  const handleVote = async (proposalId: string, voteType: number) => {
    if (!contracts) return;
    try {
      const transaction = prepareContractCall({
        contract: contracts.voteContract,
        method: "function castVote(uint256 proposalId, uint8 support) returns (uint256)",
        params: [proposalId, voteType],
      });
      const { transactionHash } = await sendTransaction({
        account: activeAccount,
        transaction,
      });
      setFetchError(null);
      console.log(
        `${t("voteSection.voteSubmitted", "Vote submitted for proposal")} ${proposalId}, ${t("voteSection.voteType", "type")}: ${voteType}`
      );
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };

  const handlePropose = async () => {
    if (!contracts) return;
    if (!proposalDescription.trim()) {
      console.error(t("errors.emptyProposal", "Proposal description is empty"));
      return;
    }
    try {
      const targets: string[] = [contracts.voteContract.address];
      const values: number[] = [0];
      const calldatas: string[] = [activeAddress || ""];
      const description = proposalDescription;
      console.log("Proposing with description:", description);
      console.log("Active address:", activeAddress);
      console.log("Proposal description:", proposalDescription);

      const transaction = await prepareContractCall({
        contract: contracts.voteContract,
        method:
          "function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256 proposalId)",
        params: [targets, values, calldatas, description],
      });
      await sendTransaction({
        transaction,
        account: activeAccount 
      });
      setFetchError(null);
      console.log(
        `${t("proposalForm.proposalSubmitted", "Proposal submitted")}: ${proposalDescription}`
      );
      setProposalDescription("");
      fetchProposals();
    } catch (error) {
      console.error("Error submitting proposal:", error);
    }
  };

  return (
    <main className="min-h-screen bg-[#d1781e] flex flex-col items-center justify-center container mx-auto">
      <header className="w-full flex justify-between items-center p-6 bg-[#201c1a] shadow-md border-b border-white-300">
        <div className="flex items-center space-x-4">
          <Image src={thirdwebIcon} alt="Brown Waters Productions" width={100} height={100} />
          <h1 className="text-2xl font-bold text-orange-500">
            {t("header.title", "Brown Waters DAO")}
          </h1>
        </div>
        {contracts ? (
          <NFTProvider contract={contracts.nftContract} tokenId={0n}>
            <div className="flex flex-col items-center">
              <NFTMedia className="w-16 h-16 rounded-full border border-orange-500" />
              <NFTName className="text-sm font-medium mt-2 text-white" />
              <NFTDescription className="text-xs text-gray-400" />
            </div>
          </NFTProvider>
        ) : (
          <div>Loading NFT...</div>
        )}
       <ConnectButton
  client={client}
  supportedTokens={{
    [polygon.id]: [
      {
        address: "0x34d63a572194F61e53b16A97Dda2fE82BF4C7e4d",
        name: "Brownie Points",
        symbol: "$BWP",
        icon: "https://bafybeidkla2kzudboxvug3mw6e7jjbhjeeub337r53k6xfvuoqnig6zgla.ipfs.dweb.link?filename=Brownie%20Points.png",
      },
    ],
  }}
  supportedNFTs={{
    [polygon.id]: [
      "0xE90D7479933E3CA7f4cC0D7A3be362008baa9f59", // nft contract address
    ],
  }}
/> 
      </header>

      {/* Onboarding Modal for new members */}
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

      {activeAddress ? (
        <section className="mt-8 space-y-6 w-full max-w-4xl px-4">
          <h2 className="text-lg font-semibold text-[#201c1a]">
            {t("welcome", { address: activeAddress })}
          </h2>
          {(hasToken || hasNFT) ? (
            <>
              <TokenSection t={t} />
              <VoteSection
                proposals={proposals}
                fetchError={fetchError}
                loadingProposals={loadingProposals}
                handleVote={handleVote}
                t={t}
              />
              {/* Proposal form container always visible */}
              <ProposalForm
                proposalDescription={proposalDescription}
                setProposalDescription={setProposalDescription}
                handlePropose={handlePropose}
                t={t}
              />
              <MintSection t={t} />

              {/* Chat Component Section */}
              <div className="bg-black shadow-lg p-6 rounded-lg mt-8 w-full">
                <h2 className="text-lg font-bold text-white">
                  {t("chat.assistant", "Virtual AI Assistant:")}
                </h2>
                <ChatComponent />
              </div>
            </>
          ) : (
            <p className="text-red-500">
              {t("errors.noAssets", "You must hold a token or NFT to propose or vote.")}
            </p>
          )}
        </section>
      ) : (
        <section className="mt-16 flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold text-[#201c1a] mb-4">
            {t("welcomeTitle", "Welcome to Brown Waters DAO")}
          </h1>
          <p className="text-black mb-6">
            {t("connectWalletPrompt", "Connect your wallet to participate in DAO activities and access exclusive $BWP token content.")}
          </p>
          <ConnectButton client={client} />
        </section>
      )}
      <ResourcesSection />
    </main>
  );
}

interface VoteSectionProps {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  proposals: any[];
  fetchError: string | null;
  loadingProposals: boolean;
  handleVote: (proposalId: string, voteType: number) => void;
  t: (key: string, fallback?: string) => string;
}

function VoteSection({ proposals, fetchError, loadingProposals, handleVote, t }: VoteSectionProps) {
  return (
    <div className="bg-black shadow-lg p-6 rounded-lg border-t-4 border-orange-500">
      <h2 className="text-lg font-bold text-white">{t("voteSection.title", "Proposals")}</h2>
      {fetchError ? (
        <p className="text-red-500 mt-4">{fetchError}</p>
      ) : loadingProposals ? (
        <p className="text-gray-600 mt-4">{t("voteSection.loading", "Loading proposals...")}</p>
      ) : proposals.length > 0 ? (
        proposals.map((proposal) => (
          <div key={proposal.id} className="border-t pt-4 mt-4">
            <p>
              <strong>{t("voteSection.id", "ID:")}</strong> {proposal.id}
            </p>
            <p>
              <strong>{t("voteSection.proposer", "Proposer:")}</strong> {proposal.proposer}
            </p>
            <p>
              <strong>{t("voteSection.description", "Description:")}</strong> {proposal.description}
            </p>
            <div className="flex space-x-4 mt-2">
              <button
                type="button"
                onClick={() => handleVote(proposal.id, 1)}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-green-600"
              >
                {t("voteSection.voteFor", "Vote For")}
              </button>
              <button
                type="button"
                onClick={() => handleVote(proposal.id, 0)}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-red-700"
              >
                {t("voteSection.voteAgainst", "Vote Against")}
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600 mt-4">{t("voteSection.noProposals", "No active proposals available.")}</p>
      )}
    </div>
  );
}

interface TokenSectionProps {
  t: (key: string, fallback?: string) => string;
}

function TokenSection({ t }: TokenSectionProps) {
  return (
    <div className="bg-black shadow-lg p-6 rounded-lg mt-6 border-t-4 border-black">
      <TokenProvider
        address="0x34d63a572194F61e53b16A97Dda2fE82BF4C7e4d"
        client={client}
        chain={polygon}
      >
        <div className="flex items-center space-x-2">
          <TokenIcon className="w-8 h-8" />
          <TokenName className="text-xl font-bold text-white" />
        </div>
      </TokenProvider>
    </div>
  );
}

interface MintSectionProps {
  t: (key: string, fallback?: string) => string;
}

function MintSection({ t }: MintSectionProps) {
  const [mintAmount, setMintAmount] = useState("1000");

  return (
    <div className="bg-black shadow-lg p-6 rounded-lg border-t-4 border-green-600">
      <h2 className="text-lg font-bold text-white">{t("mintSection.title", "Mint Options")}</h2>
      <div className="flex flex-col space-y-4 mt-4">
        <div className="flex flex-col">
          <label htmlFor="mint-amount" className="text-white">
            {t("mintSection.amountLabel", "Amount to mint:")}
          </label>
          <input
            type="number"
            id="mint-amount"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            className="p-2 rounded border"
          />
        </div>
        <div className="flex space-x-4">
          <ClaimButton
            contractAddress="0x34d63a572194F61e53b16A97Dda2fE82BF4C7e4d"
            chain={polygon}
            client={client}
            claimParams={{
              type: "ERC20",
              quantity: mintAmount,
            }}
          >
            {t("mintSection.claimToken", "Claim $BWP")}
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
            {t("mintSection.claimNFT", "Claim NFT")}
          </ClaimButton>
        </div>
      </div>
    </div>
  );
}
