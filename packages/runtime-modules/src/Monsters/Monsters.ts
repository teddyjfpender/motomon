import {
    RuntimeModule,
    runtimeModule,
    state,
    runtimeMethod,
} from "@proto-kit/module";
import { State, StateMap, assert } from "@proto-kit/protocol";
import { Field, Provable, PublicKey, Struct, PrivateKey, Signature, Bool } from "snarkyjs";

interface MonsterAttribute {
    id: Field;
    strength: Field;
    weaknessId: Field;
}

export class MonsterAttribute extends Struct({
    id: Field,
    strength: Field,
    weaknessId: Field
}) implements MonsterAttribute {
    constructor(id: Field, strength: Field, weaknessId: Field) {
        super({
            id: id,
            strength: strength,
            weaknessId: weaknessId
        })
    }

    static nullMonsterAttribute(): MonsterAttribute {
        return {
            id: Field(0),
            strength: Field(0),
            weaknessId: Field(0)
        }
    }
}

interface Monster {
    uuid: Field;
    attributes: MonsterAttribute[];
    hp: Field;
    fieldRepresentation: Field[];
}

export class MonsterStruct extends Struct({
    uuid: Field,
    attributes: Provable.Array(MonsterAttribute, 4),
    hp: Field,
    fieldRepresentation: Provable.Array(Field, 6)
}) implements Monster {
    constructor(id: Field, attributes: MonsterAttribute[], hp: Field) {
        // field representation
        const fields: Field[] = [];
        fields.push(id);
        fields.push(hp);
        for (let i = 0; i < attributes.length; i++) {
            fields.push(attributes[i].id);
            fields.push(attributes[i].strength);
            fields.push(attributes[i].weaknessId);
        }
        super({
            uuid: id,
            attributes: attributes,
            hp: hp,
            fieldRepresentation: fields
        })
    }

    static nullMonster(): Monster {
        const nullAttributes = [MonsterAttribute.nullMonsterAttribute(), MonsterAttribute.nullMonsterAttribute(), MonsterAttribute.nullMonsterAttribute(), MonsterAttribute.nullMonsterAttribute()]
        // field representation
        const fields: Field[] = [];
        fields.push(Field(0));
        fields.push(Field(0));
        for (let i = 0; i < nullAttributes.length; i++) {
            fields.push(nullAttributes[i].id);
            fields.push(nullAttributes[i].strength);
            fields.push(nullAttributes[i].weaknessId);
        }
        return {
            uuid: Field(0),
            attributes: nullAttributes,
            hp: Field(0),
            fieldRepresentation: fields
        }
    }
}

// party of monsters structs
interface MonsterParty {
    monsters: MonsterStruct[];
}

export class MonsterPartyStruct extends Struct({
    // a party is a proverable array of monsters, currently only supporting 1 monster
    monsters: Provable.Array(MonsterStruct, 1)
}) implements MonsterParty {
    constructor(monsters: MonsterStruct[]) {
        super({
            monsters
        })
    }
    static nullMonsterParty(): MonsterParty {
        const monsters = [MonsterStruct.nullMonster() as MonsterStruct]
        return {
            monsters
        }
    }
}

interface SignedMonster {
    monster: Monster;
    signature: Field;
}

export class SignedMonsterStruct extends Struct({
    monster: MonsterStruct,
    signature: Signature
}) implements SignedMonster {
    constructor(monster: MonsterStruct, privateKey: PrivateKey) {
        const monsterFields = monster.fieldRepresentation;
        const signature = Signature.create(privateKey, monsterFields);
        super({
            monster: monster,
            signature: signature
        })
    }
}

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
}
