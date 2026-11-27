/**
 * Taquito Signer backed by a Dynamic embedded ed25519 wallet, for operations
 * whose gas the user pays in MVRK (docs/dynamic-wallet.md §3.6, DYN-FE-09).
 *
 * Only signs manager operations (watermark 03) whose every content is a
 * reveal or transaction from this wallet. Permits and login payloads use
 * their own builders and never pass through here.
 *
 *   digest = BLAKE2b-256(03 || forgedBytes)
 *   sbytes = forgedBytes || sig64          (no watermark in injected bytes)
 */
import { OpKind, type Signer } from "@mavrykdynamics/taquito";
import {
  LocalForger,
  type ForgeParams,
} from "@mavrykdynamics/taquito-local-forging";

import {
  bytesToHex,
  decodeHex,
  OPERATION_WATERMARK,
  operationDigest,
  sig64ToEdsig,
  sig64ToSig,
  type MavrykKeys,
} from "~/lib/mavryk/keys";

/** Refused: not a manager-operation signature request. */
export class UnsupportedSigningDomainError extends Error {
  constructor() {
    super("This wallet only signs Mavryk operations.");
    this.name = "UnsupportedSigningDomainError";
  }
}

/** Refused: the operation does something this app did not prepare. */
export class UnexpectedOperationContentsError extends Error {
  constructor(reason: string) {
    super(`Refusing to sign an unexpected operation: ${reason}.`);
    this.name = "UnexpectedOperationContentsError";
  }
}

const ALLOWED_KINDS = new Set<string>([OpKind.REVEAL, OpKind.TRANSACTION]);

export type DynamicMavrykSignerOptions = {
  keys: Pick<MavrykKeys, "address" | "publicKey">;
  /** Signs a 32-byte digest with the selected wallet and verifies it locally */
  signDigest: (digest: Uint8Array) => Promise<Uint8Array>;
  /**
   * Last check of the decoded operation before the wallet signs it, e.g.
   * against the reviewed intent. Throw to refuse.
   */
  beforeSign?: (operation: ForgeParams) => void | Promise<void>;
  forger?: Pick<LocalForger, "parse">;
};

export class DynamicMavrykSigner implements Signer {
  private readonly forger: Pick<LocalForger, "parse">;

  constructor(private readonly options: DynamicMavrykSignerOptions) {
    this.forger = options.forger ?? new LocalForger();
  }

  async publicKey() {
    return this.options.keys.publicKey;
  }

  async publicKeyHash() {
    return this.options.keys.address;
  }

  /** Keys stay with Dynamic: signing never needs an export. */
  async secretKey() {
    return undefined;
  }

  async sign(op: string, magicByte?: Uint8Array) {
    if (magicByte?.length !== 1 || magicByte[0] !== OPERATION_WATERMARK) {
      throw new UnsupportedSigningDomainError();
    }

    // Throws on malformed hex before anything is decoded or signed
    decodeHex(op, "Forged operation");

    const operation = await this.parse(op);

    this.assertExpectedContents(operation);
    await this.options.beforeSign?.(operation);

    const sig64 = await this.options.signDigest(operationDigest(op));

    return {
      bytes: op,
      sig: sig64ToSig(sig64),
      prefixSig: sig64ToEdsig(sig64),
      sbytes: op + bytesToHex(sig64),
    };
  }

  private async parse(op: string) {
    try {
      return await this.forger.parse(op);
    } catch {
      throw new UnexpectedOperationContentsError(
        "operation bytes could not be decoded"
      );
    }
  }

  private assertExpectedContents(operation: ForgeParams) {
    const { address, publicKey } = this.options.keys;

    if (operation.contents.length === 0) {
      throw new UnexpectedOperationContentsError("no contents");
    }

    for (const content of operation.contents) {
      if (!ALLOWED_KINDS.has(content.kind)) {
        throw new UnexpectedOperationContentsError(`kind ${content.kind}`);
      }

      if (!("source" in content) || content.source !== address) {
        throw new UnexpectedOperationContentsError("source is not this wallet");
      }

      if (
        content.kind === OpKind.REVEAL &&
        "public_key" in content &&
        content.public_key !== publicKey
      ) {
        throw new UnexpectedOperationContentsError("reveal of another key");
      }
    }
  }
}
