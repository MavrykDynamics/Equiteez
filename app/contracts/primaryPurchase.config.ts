import type { MavrykToolkit } from "@mavrykdynamics/taquito";
import { basenetNetRpcnode } from "~/consts/rpcNodes";

// Basenet deployment only. Add a separate deployment before enabling another network.
const deployments: Record<
  string,
  { launchpad: string; membershipKyc: string }
> = {
  [basenetNetRpcnode]: {
    launchpad: "KT1U6KXwy8vduoq86HBjGp9m2Czc8rZM85MN",
    membershipKyc: "KT1U6z4YZPswGHcw7xAJsGZn4Wb7CZUKN1HL",
  },
};

export function getPrimaryDeployment(tezos: MavrykToolkit) {
  const deployment = deployments[tezos.rpc.getRpcUrl().replace(/\/$/, "")];
  if (!deployment)
    throw new Error("Primary purchases are unavailable on this network.");
  return deployment;
}
