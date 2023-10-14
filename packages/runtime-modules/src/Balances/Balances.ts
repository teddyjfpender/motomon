import {
    RuntimeModule,
    runtimeModule,
    state,
    runtimeMethod,
  } from "@proto-kit/module";
  
  import { State, StateMap, assert } from "@proto-kit/protocol";
  import { Bool, Field, MerkleMapWitness, Poseidon, Provable, PublicKey, UInt64 } from "snarkyjs";
  import { AirdropProof } from "@motomon/domain-model"
  /**
   * Configuration interface for the Balances module.
   */
  export interface BalancesConfig {
    /** Total supply of the token/currency. */
    totalSupply: UInt64;
    rewardsIssuerPublicKey: PublicKey;
  }
  
  /**
   * `Balances` is a runtime module responsible for managing account balances.
   * This module provides functionalities like updating an account's balance and
   * transferring tokens between accounts.
   * 
   * @decorators {runtimeModule}
   */
  @runtimeModule()
  export class Balances extends RuntimeModule<BalancesConfig> {
    
    /**
     * StateMap storing the balance for each public key.
     */
    @state() public balances = StateMap.from<PublicKey, UInt64>(
      PublicKey,
      UInt64
    );
  
    /**
     * State representing the current circulating supply.
     */
    @state() public circulatingSupply = State.from<UInt64>(UInt64);

    /**
     * Rewards Airdrop Commitment
     */
    @state() public airdropCommitment = State.from(Field);
    /**
     * Claimed Airdrop Nullifiers
     * When a user claims an airdrop, we add the nullifier to this list,
     * this should be able to be reset by the rewards issuer for a new airdrop and
     * each airdrop should include unclaimed rewards from previous airdrops
     */
    @state() public airdropNullifiers = StateMap.from<PublicKey, Bool>(PublicKey, Bool);
  
    /**
     * Set or update the balance of a given address.
     * 
     * @param address - The public key of the address.
     * @param amount - The amount to set or add to the current balance.
     * 
     * @remarks
     * This method also updates the circulating supply accordingly and ensures that
     * it never exceeds the total supply.
     */
    @runtimeMethod()
    public setBalance(address: PublicKey, amount: UInt64) {
      const circulatingSupply = this.circulatingSupply.get();
      const newCirculatingSupply = circulatingSupply.value.add(amount);
  
      assert(
        newCirculatingSupply.lessThanOrEqual(this.config.totalSupply),
        "Circulating supply would be higher than total supply"
      );
  
      this.circulatingSupply.set(newCirculatingSupply);
  
      const currentBalance = this.balances.get(address);
      const newBalance = currentBalance.value.add(amount);
  
      this.balances.set(address, newBalance);
    }
    /**
     * Transfer tokens from the transaction sender to a given address.
     * 
     * @param address - The public key of the recipient address.
     * @param amount - The amount to transfer.
     * 
     * @remarks
     * This method ensures that the sender has sufficient balance before transferring.
     * The balances of the sender and recipient are updated accordingly.
     */
    @runtimeMethod()
    public sendTo(address: PublicKey, amount: UInt64) {
        // Retrieve the public key of the transaction sender
        const sender = this.transaction.sender;
        
        // Fetch current balance of the sender and recipient from the state
        const senderBalance = this.balances.get(sender);
        const recipientBalance = this.balances.get(address);
  
        // Ensure the sender has a balance that is greater than or equal to the amount they wish to send
        assert(
          senderBalance.value.greaterThanOrEqual(amount),
          "Sender does not have enough balance"
        );
  
        // Determine the true balance of the sender. This operation ensures that in case the above assertion fails,
        // we don't accidentally subtract from an insufficient balance, which could lead to underflows.
        // If the sender has sufficient balance, we use their actual balance. If not, the balance is artificially increased,
        // which effectively becomes a no-op because the transaction will fail due to the above assertion.
        const senderBalanceTrue = Provable.if(
            senderBalance.value.greaterThanOrEqual(amount),
            senderBalance.value,
            senderBalance.value.add(amount)
        );
        
        // Deduct the specified amount from the sender's balance and add it to the recipient's balance
        this.balances.set(sender, senderBalanceTrue.sub(amount));
        this.balances.set(address, recipientBalance.value.add(amount));
    }

    /**
     * Claim tokens from the rewards merkle tree.
     */
    @runtimeMethod()
    public setAirdropCommitment(commitment: Field) {
      // this is currently unconstrained, anyone can set the commitment
      this.airdropCommitment.set(commitment);
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
      const commitment = this.airdropCommitment.get();
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
      this.setBalance(this.transaction.sender, userBalance.add(value));
      // add the nullifier to the list of nullifiers
      this.airdropNullifiers.set(address, Bool(true));
    }
  }
  