/* eslint-disable no-useless-catch */
import { TezosToolkit } from "@mavrykdynamics/taquito";
import { DodoContractType, stablecoinContract } from "~/consts/contracts";

import { RWAToken, tokensToAtoms } from "~/lib/utils/formaters";

// Exchange market (market from dropdown & admin actions - [deposit, withdraw, transfer])

type DefaultContractProps = {
  tezos: TezosToolkit;
  dodoContractAddress: DodoContractType;
  decimals: number;
};

type BuySellBaseToken = {
  mockQuoteLpToken: string;
  tokensAmount: number;
  minMaxQuote: number;
} & DefaultContractProps;

/**
 *
 *  For buying base tokens, you need to update operators for the Quote Tokens and not the Base tokens,
 *  since the Quote Tokens are being moved (or sold) by the buyer in exchange for the Base Tokens
 */
export async function buyBaseToken({
  tezos,
  dodoContractAddress, // only dodo
  tokensAmount,
  minMaxQuote,
  decimals,
}: Omit<BuySellBaseToken, "mockQuoteLpToken">) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);
    const stableCoinInstance = await tezos.wallet.at(stablecoinContract);

    const amount = tokensToAtoms(tokensAmount, decimals).toNumber();
    const parsedMinMaxQuote = tokensToAtoms(minMaxQuote, decimals).toNumber();

    const open_ops = stableCoinInstance.methodsObject["update_operators"]([
      {
        add_operator: {
          owner: sender,
          operator: dodoContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    const buy_order = marketContract.methodsObject["buyBaseToken"]({
      amount,
      minMaxQuote: parsedMinMaxQuote,
    }).toTransferParams();

    const close_ops = stableCoinInstance.methodsObject["update_operators"]([
      {
        remove_operator: {
          owner: sender,
          operator: dodoContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    batch = batch.withTransfer(open_ops);
    batch = batch.withTransfer(buy_order);
    batch = batch.withTransfer(close_ops);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

/**
 *
 * if you are selling the base tokens, you need to update operators for the Base Tokens and not the Quote tokens,
 * since the Base Tokens are being moved (or sold) by the seller in exchange for the Quote Tokens (usdt)
 */
export async function sellBaseToken({
  tezos,
  dodoContractAddress, // only dodo
  tokenAddress, // just original token address
  tokensAmount,
  minMaxQuote,
  decimals,
  quoteDecimals,
}: Omit<BuySellBaseToken, "mockQuoteLpToken"> & {
  tokenAddress: string;
  quoteDecimals: number;
}) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);
    const quoteLpInstance = await tezos.wallet.at(tokenAddress);
    const amount = tokensToAtoms(tokensAmount, decimals).toNumber();

    const parsedMinMaxQuote = tokensToAtoms(
      minMaxQuote,
      quoteDecimals
    ).toNumber();

    const open_ops = quoteLpInstance.methodsObject["update_operators"]([
      {
        add_operator: {
          owner: sender,
          operator: dodoContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    const sell_order = marketContract.methodsObject["sellBaseToken"]({
      amount,
      minMaxQuote: parsedMinMaxQuote,
    }).toTransferParams();

    const close_ops = quoteLpInstance.methodsObject["update_operators"]([
      {
        remove_operator: {
          owner: sender,
          operator: dodoContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    batch = batch.withTransfer(open_ops);
    batch = batch.withTransfer(sell_order);
    batch = batch.withTransfer(close_ops);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

type DepositActionProps = {
  rwaTokenAddress: string;
  tokensAmount: number;
} & DefaultContractProps;

export async function depositBaseToken({
  tezos,
  dodoContractAddress, // only dodo
  rwaTokenAddress,
  tokensAmount,
  decimals,
}: DepositActionProps) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);
    const rwaTokenInstance = await tezos.wallet.at(rwaTokenAddress);

    const open_ops = rwaTokenInstance.methodsObject["update_operators"]([
      {
        add_operator: {
          owner: sender,
          operator: dodoContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    const num = tokensToAtoms(tokensAmount, decimals).toNumber();

    const sell_order =
      marketContract.methodsObject["depositBaseToken"](num).toTransferParams();

    const close_ops = rwaTokenInstance.methodsObject["update_operators"]([
      {
        remove_operator: {
          owner: sender,
          operator: dodoContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    batch = batch.withTransfer(open_ops);
    batch = batch.withTransfer(sell_order);
    batch = batch.withTransfer(close_ops);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

export async function depositQuoteToken({
  tezos,
  dodoContractAddress, // only dodo
  tokensAmount,
  decimals,
}: DepositActionProps) {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);
    const rwaTokenInstance = await tezos.wallet.at(stablecoinContract);

    const open_ops = rwaTokenInstance.methodsObject["update_operators"]([
      {
        add_operator: {
          owner: sender,
          operator: dodoContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    const sell_order = marketContract.methodsObject["depositQuoteToken"](
      tokensToAtoms(tokensAmount, decimals).toNumber() // stable coin
    ).toTransferParams();

    const close_ops = rwaTokenInstance.methodsObject["update_operators"]([
      {
        remove_operator: {
          owner: sender,
          operator: dodoContractAddress,
          token_id: 0,
        },
      },
    ]).toTransferParams();

    batch = batch.withTransfer(open_ops);
    batch = batch.withTransfer(sell_order);
    batch = batch.withTransfer(close_ops);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

type WithdrawActionProps = {
  tokensAmount: number;
} & DefaultContractProps;

export async function withdrawBaseToken({
  tezos,
  dodoContractAddress, // only dodo
  tokensAmount,
  decimals,
}: WithdrawActionProps) {
  try {
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);

    const sell_order = marketContract.methodsObject["withdrawBaseToken"](
      tokensToAtoms(tokensAmount, decimals).toNumber()
    ).toTransferParams();

    batch = batch.withTransfer(sell_order);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

export async function withdrawQuoteToken({
  tezos,
  dodoContractAddress, // only dodo
  tokensAmount,
  decimals,
}: WithdrawActionProps) {
  try {
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);

    const sell_order = marketContract.methodsObject["withdrawQuoteToken"](
      tokensToAtoms(tokensAmount, decimals).toNumber()
    ).toTransferParams();

    batch = batch.withTransfer(sell_order);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

export async function withdrawAllBaseTokens({
  tezos,
  dodoContractAddress, // only dodo
}: BuySellBaseToken) {
  try {
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);

    const sell_order =
      marketContract.methodsObject[
        "withdrawAllBaseTokens"
      ]().toTransferParams();

    batch = batch.withTransfer(sell_order);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

export async function withdrawAllQuoteTokens({
  tezos,
  dodoContractAddress, // only dodo
}: BuySellBaseToken) {
  try {
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(dodoContractAddress);

    const sell_order =
      marketContract.methodsObject[
        "withdrawAllQuoteTokens"
      ]().toTransferParams();

    batch = batch.withTransfer(sell_order);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    throw e;
  }
}

// NOTE DO NOT USE THIS ACTION IN CODE ! ONLY FOR TESTS
export const transferLPTokens = async ({
  tezos,
  address = "KT1PF3ZRoxz8aYcrUccLi7txzG1YoKwK91jZ",
}: Pick<DefaultContractProps, "tezos"> & { address?: string }) => {
  try {
    const sender = await tezos.wallet.pkh();
    let batch = tezos.wallet.batch([]);

    const marketContract = await tezos.wallet.at(address); // MARS base token

    const sell_order = marketContract.methodsObject["transfer"]([
      {
        from_: sender,
        txs: [
          {
            to_: "mv1TMgthRwT69X8WMqRyeMYLPEcoEfCKqX2w",
            token_id: 0,
            amount: RWAToken(3),
          },
        ],
      },
    ]).toTransferParams();

    batch = batch.withTransfer(sell_order);

    const batchOp = await batch.send();

    await batchOp.confirmation();
  } catch (e: unknown) {
    console.log(e);
  }
};
