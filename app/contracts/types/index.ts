import { OpKind, TransferParams } from "@mavrykdynamics/taquito";

export type BatchOperationKindType = (TransferParams & {
  kind: OpKind.TRANSACTION;
})[];
