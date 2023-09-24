import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult, InstantiateResult } from "@cosmjs/cosmwasm-stargate"; 
import { StdFee } from "@cosmjs/amino";
import { Coin } from "@cosmjs/amino";
/**
 * A thin wrapper around u128 that is using strings for JSON encoding/decoding, such that the full u128 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.
 *
 * # Examples
 *
 * Use `from` to create instances of this and `u128` to get the value out:
 *
 * ``` # use cosmwasm_std::Uint128; let a = Uint128::from(123u128); assert_eq!(a.u128(), 123);
 *
 * let b = Uint128::from(42u64); assert_eq!(b.u128(), 42);
 *
 * let c = Uint128::from(70u32); assert_eq!(c.u128(), 70); ```
 */
export type Uint128 = string;
/**
 * Information about the token to use for proposal deposits.
 */
export type DepositToken =
  | {
      token: {
        denom: UncheckedDenom;
        [k: string]: unknown;
      };
    }
  | {
      voting_module_token: {
        [k: string]: unknown;
      };
    };
/**
 * A denom that has not been checked to confirm it points to a valid asset.
 */
export type UncheckedDenom =
  | {
      native: string;
    }
  | {
      cw20: string;
    };
export type DepositRefundPolicy = "always" | "only_passed" | "never";

export interface InstantiateMsg {
  /**
   * Information about the deposit requirements for this module. None if no deposit.
   */
  deposit_info?: UncheckedDepositInfo | null;
  /**
   * If false, only members (addresses with voting power) may create proposals in the DAO. Otherwise, any address may create a proposal so long as they pay the deposit.
   */
  open_proposal_submission: boolean;
  [k: string]: unknown;
}
/**
 * Information about the deposit required to create a proposal.
 */
export interface UncheckedDepositInfo {
  /**
   * The number of tokens that must be deposited to create a proposal. Must be a positive, non-zero number.
   */
  amount: Uint128;
  /**
   * The address of the token to be used for proposal deposits.
   */
  denom: DepositToken;
  /**
   * The policy used for refunding deposits on proposal completion.
   */
  refund_policy: DepositRefundPolicy;
  [k: string]: unknown;
}
/**
 * A thin wrapper around u128 that is using strings for JSON encoding/decoding, such that the full u128 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.
 *
 * # Examples
 *
 * Use `from` to create instances of this and `u128` to get the value out:
 *
 * ``` # use cosmwasm_std::Uint128; let a = Uint128::from(123u128); assert_eq!(a.u128(), 123);
 *
 * let b = Uint128::from(42u64); assert_eq!(b.u128(), 42);
 *
 * let c = Uint128::from(70u32); assert_eq!(c.u128(), 70); ```
 */
export type Uint128 = string;
/**
 * A denom that has been checked to point to a valid asset. This enum should never be constructed literally and should always be built by calling `into_checked` on an `UncheckedDenom` instance.
 */
export type CheckedDenom =
  | {
      native: string;
    }
  | {
      cw20: Addr;
    };
/**
 * A human readable address.
 *
 * In Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.
 *
 * This type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.
 *
 * This type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.
 */
export type Addr = string;
export type DepositRefundPolicy = "always" | "only_passed" | "never";
/**
 * A human readable address.
 *
 * In Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.
 *
 * This type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.
 *
 * This type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.
 */
export type Addr1 = string;
/**
 * A human readable address.
 *
 * In Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.
 *
 * This type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.
 *
 * This type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.
 */
export type Addr2 = string;
/**
 * Binary is a wrapper around Vec<u8> to add base64 de/serialization with serde. It also adds some helper methods to help encode inline.
 *
 * This is only needed as serde-json-{core,wasm} has a horrible encoding for Vec<u8>. See also <https://github.com/CosmWasm/cosmwasm/blob/main/docs/MESSAGE_TYPES.md>.
 */
export type Binary = string;
export type QueryExt = {
  overrule_proposal_id: {
    subdao_proposal_id: number;
    timelock_address: string;
    [k: string]: unknown;
  };
};
export type ProposeMessage = {
  propose_overrule: {
    proposal_id: number;
    timelock_contract: string;
    [k: string]: unknown;
  };
};
/**
 * Information about the token to use for proposal deposits.
 */
export type DepositToken =
  | {
      token: {
        denom: UncheckedDenom;
        [k: string]: unknown;
      };
    }
  | {
      voting_module_token: {
        [k: string]: unknown;
      };
    };
/**
 * A denom that has not been checked to confirm it points to a valid asset.
 */
export type UncheckedDenom =
  | {
      native: string;
    }
  | {
      cw20: string;
    };
export type Status = "open" | "rejected" | "passed" | "executed" | "closed" | "execution_failed";

export interface CwdPreProposeOverruleSchema {
  responses: Config | Addr1 | DepositInfoResponse | Addr2 | Binary;
  query: DepositInfoArgs | QueryExtensionArgs;
  execute: ProposeArgs | UpdateConfigArgs | WithdrawArgs | ProposalCreatedHookArgs | ProposalCompletedHookArgs;
  [k: string]: unknown;
}
export interface Config {
  /**
   * Information about the deposit required to create a proposal. If `None`, no deposit is required.
   */
  deposit_info?: CheckedDepositInfo | null;
  /**
   * If false, only members (addresses with voting power) may create proposals in the DAO. Otherwise, any address may create a proposal so long as they pay the deposit.
   */
  open_proposal_submission: boolean;
}
/**
 * Counterpart to the `DepositInfo` struct which has been processed. This type should never be constructed literally and should always by built by calling `into_checked` on a `DepositInfo` instance.
 */
export interface CheckedDepositInfo {
  /**
   * The number of tokens that must be deposited to create a proposal. This is validated to be non-zero if this struct is constructed by converted via the `into_checked` method on `DepositInfo`.
   */
  amount: Uint128;
  /**
   * The address of the cw20 token to be used for proposal deposits.
   */
  denom: CheckedDenom;
  /**
   * The policy used for refunding proposal deposits.
   */
  refund_policy: DepositRefundPolicy;
  [k: string]: unknown;
}
export interface DepositInfoResponse {
  /**
   * The deposit that has been paid for the specified proposal.
   */
  deposit_info?: CheckedDepositInfo | null;
  /**
   * The address that created the proposal.
   */
  proposer: Addr;
  [k: string]: unknown;
}
export interface DepositInfoArgs {
  proposal_id: number;
}
export interface QueryExtensionArgs {
  msg: QueryExt;
}
export interface ProposeArgs {
  msg: ProposeMessage;
  [k: string]: unknown;
}
export interface UpdateConfigArgs {
  deposit_info?: UncheckedDepositInfo | null;
  open_proposal_submission: boolean;
  [k: string]: unknown;
}
/**
 * Information about the deposit required to create a proposal.
 */
export interface UncheckedDepositInfo {
  /**
   * The number of tokens that must be deposited to create a proposal. Must be a positive, non-zero number.
   */
  amount: Uint128;
  /**
   * The address of the token to be used for proposal deposits.
   */
  denom: DepositToken;
  /**
   * The policy used for refunding deposits on proposal completion.
   */
  refund_policy: DepositRefundPolicy;
  [k: string]: unknown;
}
export interface WithdrawArgs {
  /**
   * The denom to withdraw funds for. If no denom is specified, the denomination currently configured for proposal deposits will be used.
   *
   * You may want to specify a denomination here if you are withdrawing funds that were previously accepted for proposal deposits but are not longer used due to an `UpdateConfig` message being executed on the contract.
   */
  denom?: UncheckedDenom | null;
  [k: string]: unknown;
}
export interface ProposalCreatedHookArgs {
  proposal_id: number;
  proposer: string;
  [k: string]: unknown;
}
export interface ProposalCompletedHookArgs {
  new_status: Status;
  proposal_id: number;
  [k: string]: unknown;
}


function isSigningCosmWasmClient(
  client: CosmWasmClient | SigningCosmWasmClient
): client is SigningCosmWasmClient {
  return 'execute' in client;
}

export class Client {
  private readonly client: CosmWasmClient | SigningCosmWasmClient;
  contractAddress: string;
  constructor(client: CosmWasmClient | SigningCosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
  }
  mustBeSigningClient() {
    return new Error("This client is not a SigningCosmWasmClient");
  }
  static async instantiate(
    client: SigningCosmWasmClient,
    sender: string,
    codeId: number,
    initMsg: InstantiateMsg,
    label: string,
    initCoins?: readonly Coin[],
    fees?: StdFee | 'auto' | number,
  ): Promise<InstantiateResult> {
    const res = await client.instantiate(sender, codeId, initMsg, label, fees, {
      ...(initCoins && initCoins.length && { funds: initCoins }),
    });
    return res;
  }
  queryProposalModule = async(): Promise<Addr> => {
    return this.client.queryContractSmart(this.contractAddress, { proposal_module: {} });
  }
  queryDao = async(): Promise<Addr> => {
    return this.client.queryContractSmart(this.contractAddress, { dao: {} });
  }
  queryConfig = async(): Promise<Config> => {
    return this.client.queryContractSmart(this.contractAddress, { config: {} });
  }
  queryDepositInfo = async(args: DepositInfoArgs): Promise<DepositInfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, { deposit_info: args });
  }
  queryQueryExtension = async(args: QueryExtensionArgs): Promise<Binary> => {
    return this.client.queryContractSmart(this.contractAddress, { query_extension: args });
  }
  propose = async(sender:string, args: ProposeArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { propose: args }, fee || "auto", memo, funds);
  }
  updateConfig = async(sender:string, args: UpdateConfigArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { update_config: args }, fee || "auto", memo, funds);
  }
  withdraw = async(sender:string, args: WithdrawArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { withdraw: args }, fee || "auto", memo, funds);
  }
  proposalCreatedHook = async(sender:string, args: ProposalCreatedHookArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { proposal_created_hook: args }, fee || "auto", memo, funds);
  }
  proposalCompletedHook = async(sender:string, args: ProposalCompletedHookArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { proposal_completed_hook: args }, fee || "auto", memo, funds);
  }
}
