import {
    RuntimeModule,
    runtimeModule,
    state,
    runtimeMethod,
} from "@proto-kit/module";
import { State, StateMap, assert } from "@proto-kit/protocol";
import { Field, Proof, PublicKey } from "snarkyjs";
import { MonsterStruct, SignedMonsterStruct } from "@motomon/domain-model";

export interface MonsterConfig {
    /** Total supply of the token/currency. */
    oraclePublicKey: PublicKey;
  }
  
/**
 * `Monsters` is a runtime module responsible for managing monsters.
 * This module provides functionalities like minting new monsters and
 * setting monsters to user's address.
 * 
 * @decorators {runtimeModule}
 */
@runtimeModule()
export class Monsters extends RuntimeModule<MonsterConfig> {
    /**
     * StateMap storing the monster for each public key.
     */
    @state() public monsterRegistry = StateMap.from<PublicKey, MonsterStruct>(
        PublicKey,
        MonsterStruct
    );

    /**
     * State representing the oracle Public Key.
     */
    @state() public oraclePublicKey = State.from<PublicKey>(PublicKey);

    /**
     * Mint a new monster and assign it to the given address.
     * 
     * @param address - The public key of the address.
     * @param oracleData - The signed monster data from the oracle.
     * 
     * @remarks
     * A user cannot have more than one monster!
     */
    @runtimeMethod()
    public mintMonster(address: PublicKey, oracleData: SignedMonsterStruct) {
        // Check if the user already has a monster
        const existingMonster = this.monsterRegistry.get(address).orElse(MonsterStruct.nullMonster() as MonsterStruct);
        // need assertNotEquals to return a Bool type
        assert(existingMonster.uuid.lessThan(Field(1)), "User already has a monster!");

        // assert the oracle data is signed by the oracle
        const oraclePublicKey = this.oraclePublicKey.get().value;
        const signature = oracleData.signature;
        const isValid = signature.verify(oraclePublicKey, oracleData.monster.fieldRepresentation);
        assert(isValid, "Oracle data is not valid!");

        // Update the monster registry with the new monster
        this.monsterRegistry.set(address, oracleData.monster);
    }

    @runtimeMethod()
    public listMonster(address: PublicKey, price: Field) {
        //
    }

    //@runtimeMethod()
    /**
     * Dynamic Monster
     */
    //public updateMonster(address: PublicKey, battleData: Proof) {
        // Check if the user already has a monster
    //    const existingMonster = this.monsterRegistry.get(address).orElse(MonsterStruct.nullMonster() as MonsterStruct);
        // need assertNotEquals to return a Bool type
    //    assert(existingMonster.uuid.greaterThan(Field(0)), "User does not have a monster!");

        // Update the monster registry with the new monster
    //    this.monsterRegistry.set(address, monster);
   // }

    //@runtimeMethod()
    // TODO: Understand how to use session keys to improve the UX
    //public battle(address: PublicKey, battleData: Proof) {
        // Check if the user already has a monster
    //    const existingMonster = this.monsterRegistry.get(address).orElse(MonsterStruct.nullMonster() as MonsterStruct);
        // need assertNotEquals to return a Bool type
    //    assert(existingMonster.uuid.greaterThan(Field(0)), "User does not have a monster!");

        // Update the monster registry with the new monster
    //    this.monsterRegistry.set(address, monster);
    //}
}
