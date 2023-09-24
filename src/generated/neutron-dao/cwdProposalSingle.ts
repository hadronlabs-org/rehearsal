import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult, InstantiateResult } from "@cosmjs/cosmwasm-stargate"; 
import { StdFee } from "@cosmjs/amino";
/**
 * Duration is a delta of time. You can add it to a BlockInfo or Expiration to move that further in the future. Note that an height-based Duration and a time-based Expiration cannot be combined
 */
export type Duration =
  | {
      height: number;
    }
  | {
      time: number;
    };
export type PreProposeInfo =
  | {
      anyone_may_propose: {
        [k: string]: unknown;
      };
    }
  | {
      module_may_propose: {
        info: ModuleInstantiateInfo;
        [k: string]: unknown;
      };
    };
/**
 * Information about the CosmWasm level admin of a contract. Used in conjunction with `ModuleInstantiateInfo` to instantiate modules.
 */
export type Admin =
  | {
      address: {
        addr: string;
        [k: string]: unknown;
      };
    }
  | {
      core_module: {
        [k: string]: unknown;
      };
    };
/**
 * Binary is a wrapper around Vec<u8> to add base64 de/serialization with serde. It also adds some helper methods to help encode inline.
 *
 * This is only needed as serde-json-{core,wasm} has a horrible encoding for Vec<u8>. See also <https://github.com/CosmWasm/cosmwasm/blob/main/docs/MESSAGE_TYPES.md>.
 */
export type Binary = string;
/**
 * The ways a proposal may reach its passing / failing threshold.
 */
export type Threshold =
  | {
      absolute_percentage: {
        percentage: PercentageThreshold;
        [k: string]: unknown;
      };
    }
  | {
      threshold_quorum: {
        quorum: PercentageThreshold;
        threshold: PercentageThreshold;
        [k: string]: unknown;
      };
    }
  | {
      absolute_count: {
        threshold: Uint128;
        [k: string]: unknown;
      };
    };
/**
 * A percentage of voting power that must vote yes for a proposal to pass. An example of why this is needed:
 *
 * If a user specifies a 60% passing threshold, and there are 10 voters they likely expect that proposal to pass when there are 6 yes votes. This implies that the condition for passing should be `yes_votes >= total_votes * threshold`.
 *
 * With this in mind, how should a user specify that they would like proposals to pass if the majority of voters choose yes? Selecting a 50% passing threshold with those rules doesn't properly cover that case as 5 voters voting yes out of 10 would pass the proposal. Selecting 50.0001% or or some variation of that also does not work as a very small yes vote which technically makes the majority yes may not reach that threshold.
 *
 * To handle these cases we provide both a majority and percent option for all percentages. If majority is selected passing will be determined by `yes > total_votes * 0.5`. If percent is selected passing is determined by `yes >= total_votes * percent`.
 *
 * In both of these cases a proposal with only abstain votes must fail. This requires a special case passing logic.
 */
export type PercentageThreshold =
  | {
      majority: {
        [k: string]: unknown;
      };
    }
  | {
      percent: Decimal;
    };
/**
 * A fixed-point decimal value with 18 fractional digits, i.e. Decimal(1_000_000_000_000_000_000) == 1.0
 *
 * The greatest possible value that can be represented is 340282366920938463463.374607431768211455 (which is (2^128 - 1) / 10^18)
 */
export type Decimal = string;
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

export interface InstantiateMsg {
  /**
   * Allows changing votes before the proposal expires. If this is enabled proposals will not be able to complete early as final vote information is not known until the time of proposal expiration.
   */
  allow_revoting: boolean;
  /**
   * If set to true proposals will be closed if their execution fails. Otherwise, proposals will remain open after execution failure. For example, with this enabled a proposal to send 5 tokens out of a DAO's reserve with 4 tokens would be closed when it is executed. With this disabled, that same proposal would remain open until the DAO's reserve was large enough for it to be executed.
   */
  close_proposal_on_execution_failure: boolean;
  /**
   * The default maximum amount of time a proposal may be voted on before expiring.
   */
  max_voting_period: Duration;
  /**
   * The minimum amount of time a proposal must be open before passing. A proposal may fail before this amount of time has elapsed, but it will not pass. This can be useful for preventing governance attacks wherein an attacker acquires a large number of tokens and forces a proposal through.
   */
  min_voting_period?: Duration | null;
  /**
   * Information about what addresses may create proposals.
   */
  pre_propose_info: PreProposeInfo;
  /**
   * The threshold a proposal must reach to complete.
   */
  threshold: Threshold;
  [k: string]: unknown;
}
/**
 * Information needed to instantiate a module.
 */
export interface ModuleInstantiateInfo {
  /**
   * CosmWasm level admin of the instantiated contract. See: <https://docs.cosmwasm.com/docs/1.0/smart-contracts/migration>
   */
  admin?: Admin | null;
  /**
   * Code ID of the contract to be instantiated.
   */
  code_id: number;
  /**
   * Label for the instantiated contract.
   */
  label: string;
  /**
   * Instantiate message to be used to create the contract.
   */
  msg: Binary;
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
 * Duration is a delta of time. You can add it to a BlockInfo or Expiration to move that further in the future. Note that an height-based Duration and a time-based Expiration cannot be combined
 */
export type Duration =
  | {
      height: number;
    }
  | {
      time: number;
    };
/**
 * The ways a proposal may reach its passing / failing threshold.
 */
export type Threshold =
  | {
      absolute_percentage: {
        percentage: PercentageThreshold;
        [k: string]: unknown;
      };
    }
  | {
      threshold_quorum: {
        quorum: PercentageThreshold;
        threshold: PercentageThreshold;
        [k: string]: unknown;
      };
    }
  | {
      absolute_count: {
        threshold: Uint128;
        [k: string]: unknown;
      };
    };
/**
 * A percentage of voting power that must vote yes for a proposal to pass. An example of why this is needed:
 *
 * If a user specifies a 60% passing threshold, and there are 10 voters they likely expect that proposal to pass when there are 6 yes votes. This implies that the condition for passing should be `yes_votes >= total_votes * threshold`.
 *
 * With this in mind, how should a user specify that they would like proposals to pass if the majority of voters choose yes? Selecting a 50% passing threshold with those rules doesn't properly cover that case as 5 voters voting yes out of 10 would pass the proposal. Selecting 50.0001% or or some variation of that also does not work as a very small yes vote which technically makes the majority yes may not reach that threshold.
 *
 * To handle these cases we provide both a majority and percent option for all percentages. If majority is selected passing will be determined by `yes > total_votes * 0.5`. If percent is selected passing is determined by `yes >= total_votes * percent`.
 *
 * In both of these cases a proposal with only abstain votes must fail. This requires a special case passing logic.
 */
export type PercentageThreshold =
  | {
      majority: {
        [k: string]: unknown;
      };
    }
  | {
      percent: Decimal;
    };
/**
 * A fixed-point decimal value with 18 fractional digits, i.e. Decimal(1_000_000_000_000_000_000) == 1.0
 *
 * The greatest possible value that can be represented is 340282366920938463463.374607431768211455 (which is (2^128 - 1) / 10^18)
 */
export type Decimal = string;
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
export type Addr1 = string;
export type Vote = "yes" | "no" | "abstain";
/**
 * Expiration represents a point in time when some event happens. It can compare with a BlockInfo and will return is_expired() == true once the condition is hit (and for every block in the future)
 */
export type Expiration =
  | {
      at_height: number;
    }
  | {
      at_time: Timestamp;
    }
  | {
      never: {};
    };
/**
 * A point in time in nanosecond precision.
 *
 * This type can represent times from 1970-01-01T00:00:00Z to 2554-07-21T23:34:33Z.
 *
 * ## Examples
 *
 * ``` # use cosmwasm_std::Timestamp; let ts = Timestamp::from_nanos(1_000_000_202); assert_eq!(ts.nanos(), 1_000_000_202); assert_eq!(ts.seconds(), 1); assert_eq!(ts.subsec_nanos(), 202);
 *
 * let ts = ts.plus_seconds(2); assert_eq!(ts.nanos(), 3_000_000_202); assert_eq!(ts.seconds(), 3); assert_eq!(ts.subsec_nanos(), 202); ```
 */
export type Timestamp = Uint64;
/**
 * A thin wrapper around u64 that is using strings for JSON encoding/decoding, such that the full u64 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.
 *
 * # Examples
 *
 * Use `from` to create instances of this and `u64` to get the value out:
 *
 * ``` # use cosmwasm_std::Uint64; let a = Uint64::from(42u64); assert_eq!(a.u64(), 42);
 *
 * let b = Uint64::from(70u32); assert_eq!(b.u64(), 70); ```
 */
export type Uint64 = string;
export type CosmosMsgFor_NeutronMsg =
  | {
      bank: BankMsg;
    }
  | {
      custom: NeutronMsg;
    }
  | {
      staking: StakingMsg;
    }
  | {
      distribution: DistributionMsg;
    }
  | {
      stargate: {
        type_url: string;
        value: Binary;
        [k: string]: unknown;
      };
    }
  | {
      ibc: IbcMsg;
    }
  | {
      wasm: WasmMsg;
    }
  | {
      gov: GovMsg;
    };
/**
 * The message types of the bank module.
 *
 * See https://github.com/cosmos/cosmos-sdk/blob/v0.40.0/proto/cosmos/bank/v1beta1/tx.proto
 */
export type BankMsg =
  | {
      send: {
        amount: Coin[];
        to_address: string;
        [k: string]: unknown;
      };
    }
  | {
      burn: {
        amount: Coin[];
        [k: string]: unknown;
      };
    };
/**
 * A number of Custom messages that can call into the Neutron bindings.
 */
export type NeutronMsg =
  | {
      register_interchain_account: {
        /**
         * *connection_id** is an IBC connection identifier between Neutron and remote chain.
         */
        connection_id: string;
        /**
         * **interchain_account_id** is an identifier of your new interchain account. Can be any string. This identifier allows contracts to have multiple interchain accounts on remote chains.
         */
        interchain_account_id: string;
        [k: string]: unknown;
      };
    }
  | {
      submit_tx: {
        /**
         * *connection_id** is an IBC connection identifier between Neutron and remote chain.
         */
        connection_id: string;
        /**
         * **fee** is an ibc fee for the transaction.
         */
        fee: IbcFee;
        /**
         * *interchain_account_id** is an identifier of your interchain account from which you want to execute msgs.
         */
        interchain_account_id: string;
        /**
         * *memo** is a memo you want to attach to your interchain transaction.It behaves like a memo in usual Cosmos transaction.
         */
        memo: string;
        /**
         * *msgs** is a list of protobuf encoded Cosmos-SDK messages you want to execute on remote chain.
         */
        msgs: ProtobufAny[];
        /**
         * *timeout** is a timeout in seconds after which the packet times out.
         */
        timeout: number;
        [k: string]: unknown;
      };
    }
  | {
      register_interchain_query: {
        /**
         * *connection_id** is an IBC connection identifier between Neutron and remote chain.
         */
        connection_id: string;
        /**
         * *keys** is the KV-storage keys for which we want to get values from remote chain.
         */
        keys: KVKey[];
        /**
         * *query_type** is a query type identifier ('tx' or 'kv' for now).
         */
        query_type: string;
        /**
         * *transactions_filter** is the filter for transaction search ICQ.
         */
        transactions_filter: string;
        /**
         * *update_period** is used to say how often the query must be updated.
         */
        update_period: number;
        [k: string]: unknown;
      };
    }
  | {
      update_interchain_query: {
        /**
         * *new_keys** is the new query keys to retrive.
         */
        new_keys?: KVKey[] | null;
        /**
         * *new_transactions_filter** is a new transactions filter of the query.
         */
        new_transactions_filter?: string | null;
        /**
         * *new_update_period** is a new update period of the query.
         */
        new_update_period?: number | null;
        /**
         * *query_id** is the ID of the query we want to update.
         */
        query_id: number;
        [k: string]: unknown;
      };
    }
  | {
      remove_interchain_query: {
        /**
         * *query_id** is ID of the query we want to remove.
         */
        query_id: number;
        [k: string]: unknown;
      };
    }
  | {
      ibc_transfer: {
        fee: IbcFee;
        memo: string;
        receiver: string;
        sender: string;
        source_channel: string;
        source_port: string;
        timeout_height: RequestPacketTimeoutHeight;
        timeout_timestamp: number;
        token: Coin;
        [k: string]: unknown;
      };
    }
  | {
      submit_admin_proposal: {
        admin_proposal: AdminProposal;
        [k: string]: unknown;
      };
    }
  | {
      create_denom: {
        subdenom: string;
        [k: string]: unknown;
      };
    }
  | {
      change_admin: {
        denom: string;
        new_admin_address: string;
        [k: string]: unknown;
      };
    }
  | {
      mint_tokens: {
        amount: Uint128;
        denom: string;
        mint_to_address: string;
        [k: string]: unknown;
      };
    }
  | {
      burn_tokens: {
        amount: Uint128;
        /**
         * Must be set to `""` for now
         */
        burn_from_address: string;
        denom: string;
        [k: string]: unknown;
      };
    }
  | {
      add_schedule: {
        /**
         * list of cosmwasm messages to be executed
         */
        msgs: MsgExecuteContract[];
        /**
         * Name of a new schedule. Needed to be able to `RemoveSchedule` and to log information about it
         */
        name: string;
        /**
         * period in blocks with which `msgs` will be executed
         */
        period: number;
        [k: string]: unknown;
      };
    }
  | {
      remove_schedule: {
        name: string;
        [k: string]: unknown;
      };
    };
/**
 * Binary is a wrapper around Vec<u8> to add base64 de/serialization with serde. It also adds some helper methods to help encode inline.
 *
 * This is only needed as serde-json-{core,wasm} has a horrible encoding for Vec<u8>. See also <https://github.com/CosmWasm/cosmwasm/blob/main/docs/MESSAGE_TYPES.md>.
 */
export type Binary = string;
/**
 * AdminProposal defines the struct for various proposals which Neutron's Admin Module may accept.
 */
export type AdminProposal =
  | {
      param_change_proposal: ParamChangeProposal;
    }
  | {
      software_upgrade_proposal: SoftwareUpgradeProposal;
    }
  | {
      cancel_software_upgrade_proposal: CancelSoftwareUpgradeProposal;
    }
  | {
      upgrade_proposal: UpgradeProposal;
    }
  | {
      client_update_proposal: ClientUpdateProposal;
    }
  | {
      pin_codes_proposal: PinCodesProposal;
    }
  | {
      unpin_codes_proposal: UnpinCodesProposal;
    }
  | {
      sudo_contract_proposal: SudoContractProposal;
    }
  | {
      update_admin_proposal: UpdateAdminProposal;
    }
  | {
      clear_admin_proposal: ClearAdminProposal;
    };
/**
 * The message types of the staking module.
 *
 * See https://github.com/cosmos/cosmos-sdk/blob/v0.40.0/proto/cosmos/staking/v1beta1/tx.proto
 */
export type StakingMsg =
  | {
      delegate: {
        amount: Coin;
        validator: string;
        [k: string]: unknown;
      };
    }
  | {
      undelegate: {
        amount: Coin;
        validator: string;
        [k: string]: unknown;
      };
    }
  | {
      redelegate: {
        amount: Coin;
        dst_validator: string;
        src_validator: string;
        [k: string]: unknown;
      };
    };
/**
 * The message types of the distribution module.
 *
 * See https://github.com/cosmos/cosmos-sdk/blob/v0.42.4/proto/cosmos/distribution/v1beta1/tx.proto
 */
export type DistributionMsg =
  | {
      set_withdraw_address: {
        /**
         * The `withdraw_address`
         */
        address: string;
        [k: string]: unknown;
      };
    }
  | {
      withdraw_delegator_reward: {
        /**
         * The `validator_address`
         */
        validator: string;
        [k: string]: unknown;
      };
    };
/**
 * These are messages in the IBC lifecycle. Only usable by IBC-enabled contracts (contracts that directly speak the IBC protocol via 6 entry points)
 */
export type IbcMsg =
  | {
      transfer: {
        /**
         * packet data only supports one coin https://github.com/cosmos/cosmos-sdk/blob/v0.40.0/proto/ibc/applications/transfer/v1/transfer.proto#L11-L20
         */
        amount: Coin;
        /**
         * exisiting channel to send the tokens over
         */
        channel_id: string;
        /**
         * when packet times out, measured on remote chain
         */
        timeout: IbcTimeout;
        /**
         * address on the remote chain to receive these tokens
         */
        to_address: string;
        [k: string]: unknown;
      };
    }
  | {
      send_packet: {
        channel_id: string;
        data: Binary;
        /**
         * when packet times out, measured on remote chain
         */
        timeout: IbcTimeout;
        [k: string]: unknown;
      };
    }
  | {
      close_channel: {
        channel_id: string;
        [k: string]: unknown;
      };
    };
/**
 * The message types of the wasm module.
 *
 * See https://github.com/CosmWasm/wasmd/blob/v0.14.0/x/wasm/internal/types/tx.proto
 */
export type WasmMsg =
  | {
      execute: {
        contract_addr: string;
        funds: Coin[];
        /**
         * msg is the json-encoded ExecuteMsg struct (as raw Binary)
         */
        msg: Binary;
        [k: string]: unknown;
      };
    }
  | {
      instantiate: {
        admin?: string | null;
        code_id: number;
        funds: Coin[];
        /**
         * A human-readbale label for the contract
         */
        label: string;
        /**
         * msg is the JSON-encoded InstantiateMsg struct (as raw Binary)
         */
        msg: Binary;
        [k: string]: unknown;
      };
    }
  | {
      migrate: {
        contract_addr: string;
        /**
         * msg is the json-encoded MigrateMsg struct that will be passed to the new code
         */
        msg: Binary;
        /**
         * the code_id of the new logic to place in the given contract
         */
        new_code_id: number;
        [k: string]: unknown;
      };
    }
  | {
      update_admin: {
        admin: string;
        contract_addr: string;
        [k: string]: unknown;
      };
    }
  | {
      clear_admin: {
        contract_addr: string;
        [k: string]: unknown;
      };
    };
/**
 * This message type allows the contract interact with the [x/gov] module in order to cast votes.
 *
 * [x/gov]: https://github.com/cosmos/cosmos-sdk/tree/v0.45.12/x/gov
 *
 * ## Examples
 *
 * Cast a simple vote:
 *
 * ``` # use cosmwasm_std::{ #     HexBinary, #     Storage, Api, Querier, DepsMut, Deps, entry_point, Env, StdError, MessageInfo, #     Response, QueryResponse, # }; # type ExecuteMsg = (); use cosmwasm_std::{GovMsg, VoteOption};
 *
 * #[entry_point] pub fn execute( deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg, ) -> Result<Response, StdError> { // ... Ok(Response::new().add_message(GovMsg::Vote { proposal_id: 4, vote: VoteOption::Yes, })) } ```
 *
 * Cast a weighted vote:
 *
 * ``` # use cosmwasm_std::{ #     HexBinary, #     Storage, Api, Querier, DepsMut, Deps, entry_point, Env, StdError, MessageInfo, #     Response, QueryResponse, # }; # type ExecuteMsg = (); # #[cfg(feature = "cosmwasm_1_2")] use cosmwasm_std::{Decimal, GovMsg, VoteOption, WeightedVoteOption};
 *
 * # #[cfg(feature = "cosmwasm_1_2")] #[entry_point] pub fn execute( deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg, ) -> Result<Response, StdError> { // ... Ok(Response::new().add_message(GovMsg::VoteWeighted { proposal_id: 4, options: vec![ WeightedVoteOption { option: VoteOption::Yes, weight: Decimal::percent(65), }, WeightedVoteOption { option: VoteOption::Abstain, weight: Decimal::percent(35), }, ], })) } ```
 */
export type GovMsg = {
  vote: {
    proposal_id: number;
    /**
     * The vote option.
     *
     * This should be called "option" for consistency with Cosmos SDK. Sorry for that. See <https://github.com/CosmWasm/cosmwasm/issues/1571>.
     */
    vote: VoteOption;
    [k: string]: unknown;
  };
};
export type VoteOption = "yes" | "no" | "abstain" | "no_with_veto";
export type Status = "open" | "rejected" | "passed" | "executed" | "closed" | "execution_failed";
export type Uint641 = number;
export type ProposalCreationPolicy =
  | {
      Anyone: {
        [k: string]: unknown;
      };
    }
  | {
      Module: {
        addr: Addr;
        [k: string]: unknown;
      };
    };
export type PreProposeInfo =
  | {
      anyone_may_propose: {
        [k: string]: unknown;
      };
    }
  | {
      module_may_propose: {
        info: ModuleInstantiateInfo;
        [k: string]: unknown;
      };
    };
/**
 * Information about the CosmWasm level admin of a contract. Used in conjunction with `ModuleInstantiateInfo` to instantiate modules.
 */
export type Admin =
  | {
      address: {
        addr: string;
        [k: string]: unknown;
      };
    }
  | {
      core_module: {
        [k: string]: unknown;
      };
    };

export interface CwdProposalSingleSchema {
  responses:
    | Config
    | Addr1
    | VoteResponse
    | InfoResponse
    | ProposalListResponse
    | VoteListResponse
    | ProposalResponse1
    | Uint641
    | ProposalCreationPolicy
    | HooksResponse
    | ProposalListResponse1
    | HooksResponse1;
  query: ProposalArgs | GetVoteArgs | ListVotesArgs;
  execute:
    | ProposeArgs
    | VoteArgs
    | ExecuteArgs
    | CloseArgs
    | UpdateConfigArgs
    | UpdatePreProposeInfoArgs
    | AddProposalHookArgs
    | RemoveProposalHookArgs
    | AddVoteHookArgs
    | RemoveVoteHookArgs;
  [k: string]: unknown;
}
/**
 * The governance module's configuration.
 */
export interface Config {
  /**
   * Allows changing votes before the proposal expires. If this is enabled proposals will not be able to complete early as final vote information is not known until the time of proposal expiration.
   */
  allow_revoting: boolean;
  /**
   * If set to true proposals will be closed if their execution fails. Otherwise, proposals will remain open after execution failure. For example, with this enabled a proposal to send 5 tokens out of a DAO's reserve with 4 tokens would be closed when it is executed. With this disabled, that same proposal would remain open until the DAO's reserve was large enough for it to be executed.
   */
  close_proposal_on_execution_failure: boolean;
  /**
   * The address of the DAO that this governance module is associated with.
   */
  dao: Addr;
  /**
   * The default maximum amount of time a proposal may be voted on before expiring.
   */
  max_voting_period: Duration;
  /**
   * The minimum amount of time a proposal must be open before passing. A proposal may fail before this amount of time has elapsed, but it will not pass. This can be useful for preventing governance attacks wherein an attacker aquires a large number of tokens and forces a proposal through.
   */
  min_voting_period?: Duration | null;
  /**
   * The threshold a proposal must reach to complete.
   */
  threshold: Threshold;
  [k: string]: unknown;
}
/**
 * Information about a vote.
 */
export interface VoteResponse {
  /**
   * None if no such vote, Some otherwise.
   */
  vote?: VoteInfo | null;
  [k: string]: unknown;
}
/**
 * Information about a vote that was cast.
 */
export interface VoteInfo {
  /**
   * The voting power behind the vote.
   */
  power: Uint128;
  /**
   * Position on the vote.
   */
  vote: Vote;
  /**
   * The address that voted.
   */
  voter: Addr;
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
/**
 * A list of proposals returned by `ListProposals` and `ReverseProposals`.
 */
export interface ProposalListResponse {
  proposals: ProposalResponse[];
  [k: string]: unknown;
}
/**
 * Information about a proposal returned by proposal queries.
 */
export interface ProposalResponse {
  /**
   * The ID of the proposal being returned.
   */
  id: number;
  proposal: SingleChoiceProposal;
  [k: string]: unknown;
}
export interface SingleChoiceProposal {
  allow_revoting: boolean;
  description: string;
  /**
   * The the time at which this proposal will expire and close for additional votes.
   */
  expiration: Expiration;
  /**
   * The minimum amount of time this proposal must remain open for voting. The proposal may not pass unless this is expired or None.
   */
  min_voting_period?: Expiration | null;
  /**
   * The messages that will be executed should this proposal pass.
   */
  msgs: CosmosMsgFor_NeutronMsg[];
  /**
   * The address that created this proposal.
   */
  proposer: Addr;
  /**
   * The block height at which this proposal was created. Voting power queries should query for voting power at this block height.
   */
  start_height: number;
  status: Status;
  /**
   * The threshold at which this proposal will pass.
   */
  threshold: Threshold;
  title: string;
  /**
   * The total amount of voting power at the time of this proposal's creation.
   */
  total_power: Uint128;
  votes: Votes;
  [k: string]: unknown;
}
export interface Coin {
  amount: Uint128;
  denom: string;
  [k: string]: unknown;
}
/**
 * IbcFee defines struct for fees that refund the relayer for `SudoMsg` messages submission. Unused fee kind will be returned back to message sender. Please refer to these links for more information: IBC transaction structure - <https://docs.neutron.org/neutron/interchain-txs/messages/#msgsubmittx> General mechanics of fee payments - <https://docs.neutron.org/neutron/feerefunder/overview/#general-mechanics>
 */
export interface IbcFee {
  /**
   * *ack_fee** is an amount of coins to refund relayer for submitting ack message for a particular IBC packet.
   */
  ack_fee: Coin[];
  /**
   * **recv_fee** currently is used for compatibility with ICS-29 interface only and must be set to zero (i.e. 0untrn), because Neutron's fee module can't refund relayer for submission of Recv IBC packets due to compatibility with target chains.
   */
  recv_fee: Coin[];
  /**
   * *timeout_fee** amount of coins to refund relayer for submitting timeout message for a particular IBC packet.
   */
  timeout_fee: Coin[];
  [k: string]: unknown;
}
/**
 * Type for wrapping any protobuf message
 */
export interface ProtobufAny {
  /**
   * *type_url** describes the type of the serialized message
   */
  type_url: string;
  /**
   * *value** must be a valid serialized protocol buffer of the above specified type
   */
  value: Binary;
  [k: string]: unknown;
}
/**
 * Describes a KV key for which you want to get value from the storage on remote chain
 */
export interface KVKey {
  /**
   * *key** is a key you want to read from the storage
   */
  key: Binary;
  /**
   * *path** is a path to the storage (storage prefix) where you want to read value by key (usually name of cosmos-packages module: 'staking', 'bank', etc.)
   */
  path: string;
  [k: string]: unknown;
}
export interface RequestPacketTimeoutHeight {
  revision_height?: number | null;
  revision_number?: number | null;
  [k: string]: unknown;
}
/**
 * ParamChangeProposal defines the struct for single parameter change proposal.
 */
export interface ParamChangeProposal {
  /**
   * *description** is a text description of proposal. Non unique.
   */
  description: string;
  /**
   * *param_changes** is a vector of params to be changed. Non unique.
   */
  param_changes: ParamChange[];
  /**
   * *title** is a text title of proposal. Non unique.
   */
  title: string;
  [k: string]: unknown;
}
/**
 * ParamChange defines the struct for parameter change request.
 */
export interface ParamChange {
  /**
   * *key** is a name of parameter. Unique for subspace.
   */
  key: string;
  /**
   * *subspace** is a key of module to which the parameter to change belongs. Unique for each module.
   */
  subspace: string;
  /**
   * *value** is a new value for given parameter. Non unique.
   */
  value: string;
  [k: string]: unknown;
}
/**
 * SoftwareUpgradeProposal defines the struct for software upgrade proposal.
 */
export interface SoftwareUpgradeProposal {
  /**
   * *description** is a text description of proposal. Non unique.
   */
  description: string;
  /**
   * *plan** is a plan of upgrade.
   */
  plan: Plan;
  /**
   * *title** is a text title of proposal. Non unique.
   */
  title: string;
  [k: string]: unknown;
}
/**
 * Plan defines the struct for planned upgrade.
 */
export interface Plan {
  /**
   * *height** is a height at which the upgrade must be performed
   */
  height: number;
  /**
   * *info** is any application specific upgrade info to be included on-chain
   */
  info: string;
  /**
   * *name** is a name for the upgrade
   */
  name: string;
  [k: string]: unknown;
}
/**
 * CancelSoftwareUpgradeProposal defines the struct for cancel software upgrade proposal.
 */
export interface CancelSoftwareUpgradeProposal {
  /**
   * *description** is a text description of proposal. Non unique.
   */
  description: string;
  /**
   * *title** is a text title of proposal. Non unique.
   */
  title: string;
  [k: string]: unknown;
}
/**
 * UpgradeProposal defines the struct for  upgrade proposal.
 */
export interface UpgradeProposal {
  /**
   * *description** is a text description of proposal.
   */
  description: string;
  /**
   * *plan** is a plan of upgrade.
   */
  plan: Plan;
  /**
   * *title** is a text title of proposal.
   */
  title: string;
  /**
   * *upgraded_client_state** is an upgraded client state.
   */
  upgraded_client_state: ProtobufAny;
  [k: string]: unknown;
}
/**
 * ClientUpdateProposal defines the struct for client update proposal.
 */
export interface ClientUpdateProposal {
  /**
   * *description** is a text description of proposal. Non unique.
   */
  description: string;
  /**
   * *subject_client_id** is a subject client id.
   */
  subject_client_id: string;
  /**
   * *substitute_client_id** is a substitute client id.
   */
  substitute_client_id: string;
  /**
   * *title** is a text title of proposal.
   */
  title: string;
  [k: string]: unknown;
}
/**
 * PinCodesProposal defines the struct for pin contract codes proposal.
 */
export interface PinCodesProposal {
  /**
   * *code_ids** is an array of codes to be pined.
   */
  code_ids: number[];
  /**
   * *description** is a text description of proposal.
   */
  description: string;
  /**
   * *title** is a text title of proposal.
   */
  title: string;
  [k: string]: unknown;
}
/**
 * UnpinCodesProposal defines the struct for unpin contract codes proposal.
 */
export interface UnpinCodesProposal {
  /**
   * *code_ids** is an array of codes to be unpined.
   */
  code_ids: number[];
  /**
   * *description** is a text description of proposal.
   */
  description: string;
  /**
   * *title** is a text title of proposal.
   */
  title: string;
  [k: string]: unknown;
}
/**
 * SudoContractProposal defines the struct for sudo execution proposal.
 */
export interface SudoContractProposal {
  /**
   * *contract** is an address of contract to be executed.
   */
  contract: string;
  /**
   * *description** is a text description of proposal.
   */
  description: string;
  /**
   * **msg*** is a sudo message.
   */
  msg: Binary;
  /**
   * *title** is a text title of proposal.
   */
  title: string;
  [k: string]: unknown;
}
/**
 * UpdateAdminProposal defines the struct for  update admin proposal.
 */
export interface UpdateAdminProposal {
  /**
   * *contract** is an address of contract to update admin.
   */
  contract: string;
  /**
   * *description** is a text description of proposal.
   */
  description: string;
  /**
   * **new_admin*** is an address of new admin
   */
  new_admin: string;
  /**
   * *title** is a text title of proposal.
   */
  title: string;
  [k: string]: unknown;
}
/**
 * SudoContractProposal defines the struct for clear admin proposal.
 */
export interface ClearAdminProposal {
  /**
   * *contract** is an address of contract admin will be removed.
   */
  contract: string;
  /**
   * *description** is a text description of proposal.
   */
  description: string;
  /**
   * *title** is a text title of proposal.
   */
  title: string;
  [k: string]: unknown;
}
/**
 * MsgExecuteContract defines a call to the contract execution
 */
export interface MsgExecuteContract {
  /**
   * *contract** is a contract address that will be called
   */
  contract: string;
  /**
   * *msg** is a contract call message
   */
  msg: string;
  [k: string]: unknown;
}
/**
 * In IBC each package must set at least one type of timeout: the timestamp or the block height. Using this rather complex enum instead of two timeout fields we ensure that at least one timeout is set.
 */
export interface IbcTimeout {
  block?: IbcTimeoutBlock | null;
  timestamp?: Timestamp | null;
  [k: string]: unknown;
}
/**
 * IBCTimeoutHeight Height is a monotonically increasing data type that can be compared against another Height for the purposes of updating and freezing clients. Ordering is (revision_number, timeout_height)
 */
export interface IbcTimeoutBlock {
  /**
   * block height after which the packet times out. the height within the given revision
   */
  height: number;
  /**
   * the version that the client is currently on (eg. after reseting the chain this could increment 1 as height drops to 0)
   */
  revision: number;
  [k: string]: unknown;
}
export interface Votes {
  abstain: Uint128;
  no: Uint128;
  yes: Uint128;
  [k: string]: unknown;
}
/**
 * Information about the votes for a proposal.
 */
export interface VoteListResponse {
  votes: VoteInfo[];
  [k: string]: unknown;
}
/**
 * Information about a proposal returned by proposal queries.
 */
export interface ProposalResponse1 {
  /**
   * The ID of the proposal being returned.
   */
  id: number;
  proposal: SingleChoiceProposal;
  [k: string]: unknown;
}
export interface HooksResponse {
  hooks: string[];
  [k: string]: unknown;
}
/**
 * A list of proposals returned by `ListProposals` and `ReverseProposals`.
 */
export interface ProposalListResponse1 {
  proposals: ProposalResponse[];
  [k: string]: unknown;
}
export interface HooksResponse1 {
  hooks: string[];
  [k: string]: unknown;
}
export interface ProposalArgs {
  proposal_id: number;
}
export interface GetVoteArgs {
  proposal_id: number;
  voter: string;
}
export interface ListVotesArgs {
  /**
   * The maximum number of votes to return in response to this query. If no limit is specified a max of 30 are returned.
   */
  limit?: number | null;
  /**
   * The proposal to list the votes of.
   */
  proposal_id: number;
  /**
   * The voter to start listing votes after. Ordering is done alphabetically.
   */
  start_after?: string | null;
}
export interface ProposeArgs {
  /**
   * A description of the proposal.
   */
  description: string;
  /**
   * The messages that should be executed in response to this proposal passing.
   */
  msgs: CosmosMsgFor_NeutronMsg[];
  /**
   * The address creating the proposal. If no pre-propose module is attached to this module this must always be None as the proposer is the sender of the propose message. If a pre-propose module is attached, this must be Some and will set the proposer of the proposal it creates.
   */
  proposer?: string | null;
  /**
   * The title of the proposal.
   */
  title: string;
  [k: string]: unknown;
}
export interface VoteArgs {
  /**
   * The ID of the proposal to vote on.
   */
  proposal_id: number;
  /**
   * The senders position on the proposal.
   */
  vote: Vote;
  [k: string]: unknown;
}
export interface ExecuteArgs {
  /**
   * The ID of the proposal to execute.
   */
  proposal_id: number;
  [k: string]: unknown;
}
export interface CloseArgs {
  /**
   * The ID of the proposal to close.
   */
  proposal_id: number;
  [k: string]: unknown;
}
export interface UpdateConfigArgs {
  /**
   * Allows changing votes before the proposal expires. If this is enabled proposals will not be able to complete early as final vote information is not known until the time of proposal expiration.
   */
  allow_revoting: boolean;
  /**
   * If set to true proposals will be closed if their execution fails. Otherwise, proposals will remain open after execution failure. For example, with this enabled a proposal to send 5 tokens out of a DAO's reserve with 4 tokens would be closed when it is executed. With this disabled, that same proposal would remain open until the DAO's reserve was large enough for it to be executed.
   */
  close_proposal_on_execution_failure: boolean;
  /**
   * The address if tge DAO that this governance module is associated with.
   */
  dao: string;
  /**
   * The default maximum amount of time a proposal may be voted on before expiring. This will only apply to proposals created after the config update.
   */
  max_voting_period: Duration;
  /**
   * The minimum amount of time a proposal must be open before passing. A proposal may fail before this amount of time has elapsed, but it will not pass. This can be useful for preventing governance attacks wherein an attacker acquires a large number of tokens and forces a proposal through.
   */
  min_voting_period?: Duration | null;
  /**
   * The new proposal passing threshold. This will only apply to proposals created after the config update.
   */
  threshold: Threshold;
  [k: string]: unknown;
}
export interface UpdatePreProposeInfoArgs {
  info: PreProposeInfo;
  [k: string]: unknown;
}
/**
 * Information needed to instantiate a module.
 */
export interface ModuleInstantiateInfo {
  /**
   * CosmWasm level admin of the instantiated contract. See: <https://docs.cosmwasm.com/docs/1.0/smart-contracts/migration>
   */
  admin?: Admin | null;
  /**
   * Code ID of the contract to be instantiated.
   */
  code_id: number;
  /**
   * Label for the instantiated contract.
   */
  label: string;
  /**
   * Instantiate message to be used to create the contract.
   */
  msg: Binary;
  [k: string]: unknown;
}
export interface AddProposalHookArgs {
  address: string;
  [k: string]: unknown;
}
export interface RemoveProposalHookArgs {
  address: string;
  [k: string]: unknown;
}
export interface AddVoteHookArgs {
  address: string;
  [k: string]: unknown;
}
export interface RemoveVoteHookArgs {
  address: string;
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
  queryProposal = async(args: ProposalArgs): Promise<ProposalResponse> => {
    return this.client.queryContractSmart(this.contractAddress, { proposal: args });
  }
  queryListProposals = async(): Promise<ProposalListResponse> => {
    return this.client.queryContractSmart(this.contractAddress, { list_proposals: {} });
  }
  queryReverseProposals = async(): Promise<ProposalListResponse> => {
    return this.client.queryContractSmart(this.contractAddress, { reverse_proposals: {} });
  }
  queryProposalCount = async(): Promise<Uint64> => {
    return this.client.queryContractSmart(this.contractAddress, { proposal_count: {} });
  }
  queryGetVote = async(args: GetVoteArgs): Promise<VoteResponse> => {
    return this.client.queryContractSmart(this.contractAddress, { get_vote: args });
  }
  queryListVotes = async(args: ListVotesArgs): Promise<VoteListResponse> => {
    return this.client.queryContractSmart(this.contractAddress, { list_votes: args });
  }
  queryProposalCreationPolicy = async(): Promise<ProposalCreationPolicy> => {
    return this.client.queryContractSmart(this.contractAddress, { proposal_creation_policy: {} });
  }
  queryProposalHooks = async(): Promise<HooksResponse> => {
    return this.client.queryContractSmart(this.contractAddress, { proposal_hooks: {} });
  }
  queryVoteHooks = async(): Promise<HooksResponse> => {
    return this.client.queryContractSmart(this.contractAddress, { vote_hooks: {} });
  }
  queryDao = async(): Promise<Addr> => {
    return this.client.queryContractSmart(this.contractAddress, { dao: {} });
  }
  queryInfo = async(): Promise<InfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, { info: {} });
  }
  propose = async(sender:string, args: ProposeArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { propose: args }, fee || "auto", memo, funds);
  }
  vote = async(sender:string, args: VoteArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { vote: args }, fee || "auto", memo, funds);
  }
  execute = async(sender:string, args: ExecuteArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { execute: args }, fee || "auto", memo, funds);
  }
  close = async(sender:string, args: CloseArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { close: args }, fee || "auto", memo, funds);
  }
  updateConfig = async(sender:string, args: UpdateConfigArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { update_config: args }, fee || "auto", memo, funds);
  }
  updatePreProposeInfo = async(sender:string, args: UpdatePreProposeInfoArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { update_pre_propose_info: args }, fee || "auto", memo, funds);
  }
  addProposalHook = async(sender:string, args: AddProposalHookArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { add_proposal_hook: args }, fee || "auto", memo, funds);
  }
  removeProposalHook = async(sender:string, args: RemoveProposalHookArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { remove_proposal_hook: args }, fee || "auto", memo, funds);
  }
  addVoteHook = async(sender:string, args: AddVoteHookArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { add_vote_hook: args }, fee || "auto", memo, funds);
  }
  removeVoteHook = async(sender:string, args: RemoveVoteHookArgs, fee?: number | StdFee | "auto", memo?: string, funds?: Coin[]): Promise<ExecuteResult> =>  {
          if (!isSigningCosmWasmClient(this.client)) { throw this.mustBeSigningClient(); }
    return this.client.execute(sender, this.contractAddress, { remove_vote_hook: args }, fee || "auto", memo, funds);
  }
}
