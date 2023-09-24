import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult, InstantiateResult } from "@cosmjs/cosmwasm-stargate"; 
import { StdFee } from "@cosmjs/amino";
import { Coin } from "@cosmjs/amino";
/**
 * A fixed-point decimal value with 18 fractional digits, i.e. Decimal(1_000_000_000_000_000_000) == 1.0
 *
 * The greatest possible value that can be represented is 340282366920938463463.374607431768211455 (which is (2^128 - 1) / 10^18)
 */
export type Decimal = string;

export interface InstantiateMsg {
  denom: string;
  /**
   * Address of distribution contract
   */
  distribution_contract: string;
  /**
   * Distribution rate (0-1) which goes to distribution contract
   */
  distribution_rate: Decimal;
  main_dao_address: string;
  /**
   * Minimum period between distribution calls
   */
  min_period: number;
  /**
   * Address of security DAO contract
   */
  security_dao_address: string;
  /**
   * Address of treasury contract
   */
  treasury_contract: string;
  /**
   * Vesting release function denominator
   */
  vesting_denominator: number;
  [k: string]: unknown;
}
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
/**
 * A fixed-point decimal value with 18 fractional digits, i.e. Decimal(1_000_000_000_000_000_000) == 1.0
 *
 * The greatest possible value that can be represented is 340282366920938463463.374607431768211455 (which is (2^128 - 1) / 10^18)
 */
export type Decimal = string;
/**
 * Information about if the contract is currently paused.
 */
export type PauseInfoResponse =
  | {
      paused: {
        until_height: number;
        [k: string]: unknown;
      };
    }
  | {
      unpaused: {
        [k: string]: unknown;
      };
    };
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

export interface NeutronReserveSchema {
  responses: Config | PauseInfoResponse | StatsResponse;
  execute: UpdateConfigArgs | PauseArgs;
  [k: string]: unknown;
}
export interface Config {
  denom: string;
  /**
   * Address of distribution contract, which will receive funds defined but distribution_rate %
   */
  distribution_contract: Addr;
  /**
   * Distribution rate (0-1) which goes to distribution contract
   */
  distribution_rate: Decimal;
  /**
   * Address of the main DAO contract
   */
  main_dao_address: Addr;
  /**
   * Minimum period between distribution calls
   */
  min_period: number;
  /**
   * Address of the security DAO contract
   */
  security_dao_address: Addr;
  /**
   * Address of treasury contract, which will receive funds defined by 100-distribution_rate %
   */
  treasury_contract: Addr;
  vesting_denominator: number;
  [k: string]: unknown;
}
export interface StatsResponse {
  total_distributed: Uint128;
  total_processed_burned_coins: Uint128;
  total_reserved: Uint128;
  [k: string]: unknown;
}
export interface UpdateConfigArgs {
  distribution_contract?: string | null;
  distribution_rate?: Decimal | null;
  min_period?: number | null;
  security_dao_address?: string | null;
  treasury_contract?: string | null;
  vesting_denominator?: number | null;
  [k: string]: unknown;
}
export interface PauseArgs {
  duration: number;
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
  queryConfig = async(): Promise<Config> => {
    return this.client.queryContractSmart(this.contractAddress, { config: {} });
  }
  queryStats = async(): Promise<StatsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, { stats: {} });
  }
  queryPauseInfo = async(): Promise<PauseInfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, { pause_info: {} });
  }
  transferOwnership = async(sender: string, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { transfer_ownership: {} }, fee || "auto", memo, funds);
  }
  distribute = async(sender: string, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { distribute: {} }, fee || "auto", memo, funds);
  }
  updateConfig = async(sender:string, args: UpdateConfigArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { update_config: args }, fee || "auto", memo, funds);
  }
  pause = async(sender:string, args: PauseArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { pause: args }, fee || "auto", memo, funds);
  }
  unpause = async(sender: string, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { unpause: {} }, fee || "auto", memo, funds);
  }
}
