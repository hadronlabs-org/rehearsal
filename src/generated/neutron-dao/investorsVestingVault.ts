import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult, InstantiateResult } from "@cosmjs/cosmwasm-stargate"; 
import { StdFee } from "@cosmjs/amino";
import { Coin } from "@cosmjs/amino";
export interface InstantiateMsg {
  description: string;
  name: string;
  owner: string;
  vesting_contract_address: string;
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
 * A human readable address.
 *
 * In Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.
 *
 * This type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.
 *
 * This type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.
 */
export type Addr1 = string;
export type String = string;
export type ArrayOfTupleOf_AddrAnd_Uint128 = [Addr, Uint128][];
export type String1 = string;

export interface InvestorsVestingVaultSchema {
  responses:
    | BondingStatusResponse
    | Config
    | Addr1
    | String
    | InfoResponse
    | ArrayOfTupleOf_AddrAnd_Uint128
    | String1
    | TotalPowerAtHeightResponse
    | VotingPowerAtHeightResponse;
  query: VotingPowerAtHeightArgs | BondingStatusArgs;
  execute: UpdateConfigArgs | UnbondArgs;
  [k: string]: unknown;
}
export interface BondingStatusResponse {
  bonding_enabled: boolean;
  height: number;
  unbondable_abount: Uint128;
  [k: string]: unknown;
}
export interface Config {
  description: string;
  name: string;
  owner: Addr;
  vesting_contract_address: Addr;
  [k: string]: unknown;
}
export interface InfoResponse {
  info: ContractVersion;
  [k: string]: unknown;
}
export interface ContractVersion {
  /**
   * contract is the crate name of the implementing contract, eg. `crate:cw20-base` we will use other prefixes for other languages, and their standard global namespacing
   */
  contract: string;
  /**
   * version is any string that this implementation knows. It may be simple counter "1", "2". or semantic version on release tags "v0.7.0", or some custom feature flag list. the only code that needs to understand the version parsing is code that knows how to migrate from the given contract (and is tied to it's implementation somehow)
   */
  version: string;
}
export interface TotalPowerAtHeightResponse {
  height: number;
  power: Uint128;
  [k: string]: unknown;
}
export interface VotingPowerAtHeightResponse {
  height: number;
  power: Uint128;
  [k: string]: unknown;
}
export interface VotingPowerAtHeightArgs {
  address: string;
  height?: number | null;
}
export interface BondingStatusArgs {
  address: string;
  height?: number | null;
}
export interface UpdateConfigArgs {
  description?: string | null;
  name?: string | null;
  owner?: string | null;
  vesting_contract_address?: string | null;
  [k: string]: unknown;
}
export interface UnbondArgs {
  amount: Uint128;
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
  queryVotingPowerAtHeight = async(args: VotingPowerAtHeightArgs): Promise<VotingPowerAtHeightResponse> => {
    return this.client.queryContractSmart(this.contractAddress, { voting_power_at_height: args });
  }
  queryTotalPowerAtHeight = async(): Promise<TotalPowerAtHeightResponse> => {
    return this.client.queryContractSmart(this.contractAddress, { total_power_at_height: {} });
  }
  queryBondingStatus = async(args: BondingStatusArgs): Promise<BondingStatusResponse> => {
    return this.client.queryContractSmart(this.contractAddress, { bonding_status: args });
  }
  queryDao = async(): Promise<Addr> => {
    return this.client.queryContractSmart(this.contractAddress, { dao: {} });
  }
  queryName = async(): Promise<String> => {
    return this.client.queryContractSmart(this.contractAddress, { name: {} });
  }
  queryDescription = async(): Promise<String> => {
    return this.client.queryContractSmart(this.contractAddress, { description: {} });
  }
  queryListBonders = async(): Promise<ArrayOfTupleOf_AddrAnd_Uint128> => {
    return this.client.queryContractSmart(this.contractAddress, { list_bonders: {} });
  }
  queryInfo = async(): Promise<InfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, { info: {} });
  }
  updateConfig = async(sender:string, args: UpdateConfigArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { update_config: args }, fee || "auto", memo, funds);
  }
  bond = async(sender: string, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { bond: {} }, fee || "auto", memo, funds);
  }
  unbond = async(sender:string, args: UnbondArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { unbond: args }, fee || "auto", memo, funds);
  }
}
