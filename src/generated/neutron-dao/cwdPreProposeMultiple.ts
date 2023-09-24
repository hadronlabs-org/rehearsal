import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult, InstantiateResult } from "@cosmjs/cosmwasm-stargate"; 
import { StdFee } from "@cosmjs/amino";
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
export type ProposeMessage = {
  propose: {
    choices: MultipleChoiceOptions;
    description: string;
    title: string;
  };
};
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
        value: Binary1;
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
export type Binary1 = string;
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
        data: Binary1;
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
        msg: Binary1;
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
        msg: Binary1;
        [k: string]: unknown;
      };
    }
  | {
      migrate: {
        contract_addr: string;
        /**
         * msg is the json-encoded MigrateMsg struct that will be passed to the new code
         */
        msg: Binary1;
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

export interface CwdPreProposeMultipleSchema {
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
  msg: Empty;
}
/**
 * An empty struct that serves as a placeholder in different places, such as contracts that don't set a custom message.
 *
 * It is designed to be expressable in correct JSON and JSON Schema but contains no meaningful data. Previously we used enums without cases, but those cannot represented as valid JSON Schema (https://github.com/CosmWasm/cosmwasm/issues/451)
 */
export interface Empty {
  [k: string]: unknown;
}
export interface ProposeArgs {
  msg: ProposeMessage;
  [k: string]: unknown;
}
/**
 * Represents unchecked multipl choice options
 */
export interface MultipleChoiceOptions {
  options: MultipleChoiceOption[];
  [k: string]: unknown;
}
/**
 * Unchecked multiple choice option
 */
export interface MultipleChoiceOption {
  description: string;
  msgs?: CosmosMsgFor_NeutronMsg[] | null;
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
  value: Binary1;
  [k: string]: unknown;
}
/**
 * Describes a KV key for which you want to get value from the storage on remote chain
 */
export interface KVKey {
  /**
   * *key** is a key you want to read from the storage
   */
  key: Binary1;
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
  msg: Binary1;
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
