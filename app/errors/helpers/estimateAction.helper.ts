import {
  ContractMethod,
  OpKind,
  SendParams,
  MavrykToolkit,
  TransferParams,
  Wallet,
} from "@mavrykdynamics/taquito";

import {
  estimateBatchOperation,
  getContractErrorMessage,
} from "./walletError.helper";
import { checkWhetherWalletAbortError, WalletOperationError } from "../error";
import type {
  ActionErrorReturnType,
  ActionSuccessReturnType,
  ContractActionLifecycleCallbacks,
} from "~/contracts/actions.type";
import { EstimatedBatchCall, WalletErrorPayload } from "../error.type";
import { BatchOperationKindType } from "~/contracts/types";

type EstimationResultParams = {
  callback?: () => void;
  params?: Partial<SendParams>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getWalletErrorPayload = (rawError: unknown) => {
  if (!isRecord(rawError) || !Array.isArray(rawError.data)) return undefined;

  const errorData = rawError.data[1];

  if (!isRecord(errorData) || !isRecord(errorData.with)) return undefined;

  const stringPayload = errorData.with.string;
  const intPayload = errorData.with.int;

  if (typeof stringPayload === "string") return stringPayload;
  if (typeof intPayload === "string" || typeof intPayload === "number") {
    return String(intPayload);
  }

  return undefined;
};

// WHile estimation logic is comented, use this function to hanlde tezos wallet errors
function handleErrorWhenEstimationLogicIsDisabled(e: unknown) {
  const withPayload = getWalletErrorPayload(e);

  if (checkWhetherWalletAbortError(e))
    return {
      actionSuccess: false,
      error: new WalletOperationError("Operation is aborted"),
    };
  else if (withPayload) {
    return {
      actionSuccess: false,
      error: getContractErrorMessage(new Error(withPayload), true),
    };
  }
  // throw e
  return {
    actionSuccess: false,
    error: {
      message: "Invalid Transaction",
      description: "Please review documentation",
    },
  };
}

export async function getEstimationResult(
  metadata: ContractMethod<Wallet>,
  args?: EstimationResultParams
): Promise<ActionErrorReturnType | ActionSuccessReturnType> {
  try {
    const operation = await metadata.send(args?.params);

    args?.callback?.();

    return { actionSuccess: true, operation };
  } catch (e) {
    return handleErrorWhenEstimationLogicIsDisabled(e);
  }
}

type EstimationResultSuccess = {
  actionSuccess: true;
  data: EstimatedBatchCall;
  error: null;
};

type EstimationResultError = {
  actionSuccess: false;
  data: null;
  error: WalletErrorPayload | string;
};

type EstimationResult = EstimationResultSuccess | EstimationResultError;

export async function getEstimationBatchResult(
  mavryk: MavrykToolkit,
  batchArr: (TransferParams & { kind: OpKind.TRANSACTION })[]
): Promise<EstimationResult> {
  const estimateBatchOp = await estimateBatchOperation(mavryk, batchArr);

  if (estimateBatchOp.error) {
    return {
      actionSuccess: false,
      error: estimateBatchOp.error,
      data: null,
    };
  }

  return {
    actionSuccess: true,
    data: estimateBatchOp,
    error: null,
  };
}

// Call the actual contract batch operation
export async function sendContractBatchOperation(
  mavryk: MavrykToolkit,
  batchArr: BatchOperationKindType,
  callbacks: ContractActionLifecycleCallbacks = {}
) {
  try {
    const batchOp = await mavryk.wallet.batch(batchArr).send();
    callbacks.onTransactionSubmitted?.();
    await batchOp.confirmation();
  } catch (e) {
    console.error("Error during executing operation");
    throw e;
  }
}
