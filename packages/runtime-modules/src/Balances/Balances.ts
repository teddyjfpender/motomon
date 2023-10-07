import {
    RuntimeModule,
    runtimeModule,
    state,
    runtimeMethod,
  } from "@proto-kit/module";
  
  import { State, StateMap, assert } from "@proto-kit/protocol";
  import { Provable, PublicKey, UInt64 } from "snarkyjs";
  
  /**
   * Configuration interface for the Balances module.
   */
  export interface BalancesConfig {
    /** Total supply of the token/currency. */
    totalSupply: UInt64;
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
  }
  