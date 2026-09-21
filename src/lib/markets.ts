export type Market = {
  marketId: string;
  category: string;
  title: string;
  description: string;
  phase: "primary" | "secondary" | "resolved" | "cancelled";
  region: string;
  volumeUsdc: string;
  yesPrice: string;
  noPrice: string;
  endTime: number;
  change24h: number;
  sparkline: number[];
};

export type MarketsResponse = {
  items: Market[];
  source: "panta" | "preview";
  message?: string;
};

export const previewMarkets: Market[] = [
  { marketId:"preview-fed-september", category:"Macro", title:"Will the Fed cut rates at its next meeting?", description:"Resolves YES if the target range is lowered at the next scheduled FOMC meeting.", phase:"primary", region:"Global", volumeUsdc:"18420.00", yesPrice:"0.63", noPrice:"0.37", endTime:1790121600, change24h:7.2, sparkline:[42,44,43,48,46,51,53,52,58,56,60,63] },
  { marketId:"preview-solana-throughput", category:"Crypto", title:"Will Solana sustain 2,000 non-vote TPS this month?", description:"Resolves from the network's public performance dashboard at month end.", phase:"primary", region:"Global", volumeUsdc:"9125.50", yesPrice:"0.71", noPrice:"0.29", endTime:1790812800, change24h:2.8, sparkline:[62,64,63,66,65,68,66,67,69,68,70,71] },
  { marketId:"preview-ai-revenue", category:"Business", title:"Will a listed AI lab report $10B quarterly revenue in 2027?", description:"Resolves from a qualifying company's filed quarterly results during 2027.", phase:"primary", region:"Global", volumeUsdc:"6844.10", yesPrice:"0.46", noPrice:"0.54", endTime:1830211200, change24h:-3.1, sparkline:[55,53,54,52,50,51,49,47,48,45,47,46] },
  { marketId:"preview-bitcoin-high", category:"Crypto", title:"Will Bitcoin set a new all-time high before year end?", description:"Resolves YES if the reference spot index closes above the prior record before December 31.", phase:"primary", region:"Global", volumeUsdc:"27108.00", yesPrice:"0.58", noPrice:"0.42", endTime:1798675200, change24h:1.4, sparkline:[51,50,53,52,54,56,55,57,56,59,57,58] },
];
