import BigNumber from "bignumber.js";
import { MavrykToolkit } from "@mavrykdynamics/webmavryk";
import memoizee from "memoizee";
import type { AssetMetadataBase } from "~/lib/metadata";
import { fromAssetSlug } from "~/lib/assets";
import { isFA2Token, isMavSlug } from "~/lib/metadata";
import { Asset } from "~/lib/assets/types";
import { tokensToAtoms } from "~/lib/utils/formaters";
import {
  validateAddress,
  ValidationResult,
} from "@mavrykdynamics/webmavryk-utils";
import { detectTokenStandard } from "~/lib/assets/standarts";

export const loadContract = memoizee(fetchContract, {
  promise: true,
  max: 100,
});

function fetchContract(
  tezos: MavrykToolkit,
  address: string,
  walletAPI = true
) {
  return walletAPI ? tezos.wallet.at(address) : tezos.contract.at(address);
}

export function isKTAddress(address: string) {
  return address?.startsWith("KT");
}

export const transferImplicit = (key: string, mumav: BigNumber) => {
  return [
    { prim: "DROP" },
    { prim: "NIL", args: [{ prim: "operation" }] },
    {
      prim: "PUSH",
      args: [{ prim: "key_hash" }, { string: key }],
    },
    { prim: "IMPLICIT_ACCOUNT" },
    {
      prim: "PUSH",
      args: [{ prim: "mumav" }, { int: mumav.toFixed() }],
    },
    { prim: "UNIT" },
    { prim: "TRANSFER_TOKENS" },
    { prim: "CONS" },
  ];
};

export const transferToContract = (key: string, mumav: BigNumber) => {
  return [
    { prim: "DROP" },
    { prim: "NIL", args: [{ prim: "operation" }] },
    {
      prim: "PUSH",
      args: [{ prim: "address" }, { string: key }],
    },
    { prim: "CONTRACT", args: [{ prim: "unit" }] },
    [
      {
        prim: "IF_NONE",
        args: [[[{ prim: "UNIT" }, { prim: "FAILWITH" }]], []],
      },
    ],
    {
      prim: "PUSH",
      args: [{ prim: "mumav" }, { int: `${mumav.toFixed()}` }],
    },
    { prim: "UNIT" },
    { prim: "TRANSFER_TOKENS" },
    { prim: "CONS" },
  ];
};

export const toTransferParams = async (
  tezos: MavrykToolkit,
  assetSlug: string,
  assetMetadata: AssetMetadataBase,
  fromPkh: string,
  toPkh: string,
  amount: BigNumber.Value
) => {
  const asset = await fromAssetSlugWithStandardDetect(tezos, assetSlug);

  if (isMavSlug(asset)) {
    return {
      to: toPkh,
      amount: amount as any,
      source: fromPkh,
    };
  }

  const contract = await loadContract(tezos, asset.contract);
  const pennyAmount = tokensToAtoms(amount, assetMetadata.decimals).toFixed();

  if (isFA2Token(asset))
    /*
     * `contract.methods.transfer` is not working for Rarible contracts.
     * E.g. `KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS_${63714 | 58076}`
     */
    return [
      {
        from_: fromPkh,
        txs: [
          {
            to_: toPkh,
            token_id: 0,
            amount: amount,
          },
        ],
      },
    ];

  return contract.methods
    .transfer(fromPkh, toPkh, pennyAmount)
    .toTransferParams();
};

export function isAddressValid(address: string) {
  return validateAddress(address) === ValidationResult.VALID;
}

export const isValidContractAddress = (address: string) =>
  isAddressValid(address) && isKTAddress(address);

export const fromAssetSlugWithStandardDetect = async (
  tezos: MavrykToolkit,
  slug: string
): Promise<Asset> => {
  if (isMavSlug(slug)) return slug;

  const [contractAddress, tokenIdStr] = fromAssetSlug(slug);

  if (!isValidContractAddress(contractAddress)) {
    throw new Error("Invalid contract address");
  }

  const tokenStandard = await detectTokenStandard(tezos, contractAddress);

  return {
    contract: contractAddress,
    id: tokenStandard === "fa2" ? (tokenIdStr ?? "0") : undefined,
  };
};
