import {
  ContractMethod,
  OpKind,
  SendParams,
  MavrykToolkit,
  TransferParams,
  Wallet,
  WalletOperationBatch,
} from "@mavrykdynamics/taquito";

import {
  estimateBatchOperation,
  getContractErrorMessage,
} from "./walletError.helper";
import { checkWhetherWalletAbortError, WalletOperationError } from "../error";
import {
  ActionErrorReturnType,
  ActionSuccessReturnType,
} from "~/contracts/actions.type";
import { EstimatedBatchCall, WalletErrorPayload } from "../error.type";
import { BatchOperationKindType } from "~/contracts/types";

type EstimationResultParams = {
  callback?: () => void;
  params?: Partial<SendParams>;
};

// WHile estimation logic is comented, use this function to hanlde tezos wallet errors
function handleErrorWhenEstimationLogicIsDisabled(e: unknown) {
  const rawError: any = e;

  if (checkWhetherWalletAbortError(rawError))
    return {
      actionSuccess: false,
      error: new WalletOperationError("Operation is aborted"),
    };
  else if (rawError.data[1]?.with?.string || rawError.data[1]?.with?.int) {
    const _with = rawError.data[1]?.with;
    const withPayload = _with?.string ? _with.string : _with?.int;

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
  batchArr: BatchOperationKindType
) {
  try {
    const batchOp = await mavryk.wallet.batch(batchArr).send();
    await batchOp.confirmation();
  } catch (e) {
    console.error("Error during executing operation");
    throw e;
  }
}
