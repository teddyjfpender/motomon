import {
    RuntimeModule,
    runtimeModule,
    state,
    runtimeMethod,
} from "@proto-kit/module";

import { State, StateMap, assert } from "@proto-kit/protocol";
import { Bool, Field, MerkleMapWitness, Poseidon, Provable, PublicKey, UInt64 } from "snarkyjs";
import { inject } from "tsyringe";
import { Balances } from "../Balances/Balances";
  
  /**
   * `Airdrop` is a runtime module responsible for managing claimable airdrops.
   * This module is interoperable with the Balances Runtime Module.
   */
  @runtimeModule()
  export class Airdrop extends RuntimeModule<unknown> {

    /**
     * Rewards Airdrop Commitment
     */
    @state() public commitment = State.from<Field>(Field);
    /**
     * Claimed Airdrop Nullifiers
     * When a user claims an airdrop, we add the nullifier to this list,
     * this should be able to be reset by the rewards issuer for a new airdrop and
     * each airdrop should include unclaimed rewards from previous airdrops
     */
    @state() public claimed = StateMap.from<PublicKey, Bool>(PublicKey, Bool);

    public constructor(@inject("Balances") balances: Balances) {
        super();
    }

    /**
     * Claim tokens from the rewards merkle tree.
     */
    @runtimeMethod()
    public setAirdropCommitment(commitment: Field) {
      // this is currently unconstrained, anyone can set the commitment
      this.commitment.set(commitment);
      // reset the nullifiers
      // TODO
    }

    /**
     * Method to claim an amount from the airdrop,
     * using a proof of being a part of the airdrop
     * @param airdropProof
     */
    @runtimeMethod()
    public claim(witness: MerkleMapWitness, airdropAmount: UInt64) {
      // get the public key of the transaction sender
      const address = this.transaction.sender;
      // get the commitment from the state
      const commitment = this.commitment.get().value;
      assert(
        commitment.greaterThan(Field(0)),
        "Airdrop commitment has not been set"
        );
      // check if the user has already claimed
      const isClaimed = this.claimed.get(address).orElse(Bool(false));
      assert(
        isClaimed.equals(Bool(false)),
        "User has already claimed airdrop"
      )
      // check if the user is eligible to claim
      const key = Poseidon.hash(address.toFields());
      // check if the user is eligible to claim
      const [computedRoot, computedKey] = witness.computeRootAndKey(
        Poseidon.hash(airdropAmount.toFields())
      );
      // check if the computed key matches the key in the witness
      assert(
        key.equals(computedKey),
        "Computed key from witness does not match the required key"
      );
      // check if the computed root matches the on-chain commitment
      assert(
        computedRoot.equals(commitment),
        "Airdrop proof commitment does not match on-chain commitment"
      );
      // get the users balance
      const userBalance = this.balances.get(address).value;
      this.balances.setBalance(this.transaction.sender, userBalance.add(airdropAmount));
      // add the nullifier to the list of nullifiers
      this.claimed.set(address, Bool(true));
    }
  }
  