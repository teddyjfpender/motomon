import {
    RuntimeModule,
    runtimeModule,
    state,
    runtimeMethod,
} from "@proto-kit/module";

import { State, StateMap, assert } from "@proto-kit/protocol";
import { Bool, Field, MerkleMapWitness, Poseidon, Provable, PublicKey, UInt64 } from "snarkyjs";
import { inject } from "tsyringe";
import { Balances } from "..";
  
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
    @state() public airdropNullifiers = StateMap.from<PublicKey, Bool>(PublicKey, Bool);

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
      this.airdropNullifiers = StateMap.from<PublicKey, Bool>(PublicKey, Bool);
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
      const commitment = this.commitment.get();
      // check if the user has already claimed
      const nullifier = this.airdropNullifiers.get(address).orElse(Bool(false));
      nullifier.assertEquals(Bool(false), "User has already claimed airdrop");
      // check if the user is eligible to claim
      const key = Poseidon.hash(address.toFields());
      const value = Provable.witness(UInt64, () => airdropAmount);
      // check if the user is eligible to claim
      const [computedRoot, computedKey] = witness.computeRootAndKey(
        Poseidon.hash(value.toFields())
      );
      // check if the computed key matches the key in the witness
      key.assertEquals(
        computedKey,
        "Computed key from witness does not match the required key"
      );
      // check if the computed root matches the on-chain commitment
      console.log("Computed Root: ", computedRoot.toBigInt());
      console.log("On-Chain Commitment: ", commitment.value.toBigInt());
      assert(
        computedRoot.equals(commitment.value),
        "Airdrop proof commitment does not match on-chain commitment"
      );
      // get the users balance
      const userBalance = this.balances.get(address).value;
      this.balances.setBalance(this.transaction.sender, userBalance.add(value));
      // add the nullifier to the list of nullifiers
      this.airdropNullifiers.set(address, Bool(true));
    }
  }
  