import { Field, PrivateKey, Provable, Signature, Struct } from "snarkyjs";

interface MonsterAttribute {
    id: Field;
    strength: Field;
    moveCount: Field;
}

export class MonsterAttributeStruct extends Struct({
    id: Field,
    strength: Field,
    moveCount: Field
}) implements MonsterAttribute {
    constructor(id: Field, strength: Field, moveCount: Field) {
        super({
            id: id,
            strength: strength,
            moveCount: moveCount
        })
    }

    static nullMonsterAttribute(): MonsterAttribute {
        return {
            id: Field(0),
            strength: Field(0),
            moveCount: Field(0)
        }
    }

    toJSON() {
        return {
            id: this.id.toJSON(),
            strength: this.strength.toJSON(),
            moveCount: this.moveCount.toJSON()
        }
    }

    fromJSON(json: any) {
        return new MonsterAttributeStruct(Field.fromJSON(json.id), Field.fromJSON(json.strength), Field.fromJSON(json.moveCount))
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
    attributes: Provable.Array(MonsterAttributeStruct, 4),
    hp: Field,
    fieldRepresentation: Provable.Array(Field, 6)
}) implements Monster {
    constructor(id: Field, attributes: MonsterAttributeStruct[], hp: Field) {
        // field representation
        const fields: Field[] = [];
        fields.push(id);
        fields.push(hp);
        for (let i = 0; i < attributes.length; i++) {
            fields.push(attributes[i].id);
            fields.push(attributes[i].strength);
            fields.push(attributes[i].moveCount);
        }
        super({
            uuid: id,
            attributes: attributes,
            hp: hp,
            fieldRepresentation: fields
        })
    }

    updateHP(hit: Field) {
        const newHp = Provable.if(this.hp.greaterThanOrEqual(hit), this.hp.sub(hit), Field(0))
        return this.hp = newHp
    }

    isFainted() {
        return this.hp.equals(Field(0))
    }

    static nullMonster(): Monster {
        const nullAttributes = [MonsterAttributeStruct.nullMonsterAttribute(), MonsterAttributeStruct.nullMonsterAttribute(), MonsterAttributeStruct.nullMonsterAttribute(), MonsterAttributeStruct.nullMonsterAttribute()]
        // field representation
        const fields: Field[] = [];
        fields.push(Field(0));
        fields.push(Field(0));
        for (let i = 0; i < nullAttributes.length; i++) {
            fields.push(nullAttributes[i].id);
            fields.push(nullAttributes[i].strength);
            fields.push(nullAttributes[i].moveCount);
        }
        return {
            uuid: Field(0),
            attributes: nullAttributes,
            hp: Field(0),
            fieldRepresentation: fields
        }
    }

    toJSON() {
        return {
            uuid: this.uuid.toJSON(),
            attributes: this.attributes.map((attribute) => attribute.toJSON()),
            hp: this.hp.toJSON(),
            fieldRepresentation: this.fieldRepresentation.map((field) => field.toJSON())
        }
    }

    fromJSON(json: any) {
        const attributes = json.attributes.map((attribute: any) => MonsterAttributeStruct.fromJSON(attribute)) 
        return new MonsterStruct(Field.fromJSON(json.uuid), attributes as MonsterAttributeStruct[], Field.fromJSON(json.hp))
    }
}

// party of monsters structs
interface MonsterParty {
    monsters: MonsterStruct[];
}

export class MonsterPartyStruct extends Struct({
    // a party is a provable array of monsters, currently only supporting 1 monster
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
    constructor(monster: MonsterStruct, privateKey: string) {
        const signingPrivateKey = PrivateKey.fromBase58(privateKey)
        const monsterFields = monster.fieldRepresentation;
        const signature = Signature.create(signingPrivateKey, monsterFields);
        super({
            monster: monster,
            signature: signature
        })
    }

    toJSON() {
        return {
            monster: this.monster.toJSON(),
            signature: this.signature.toJSON()
        }
    }

    fromJSON(json: any) {
        return { monster: MonsterStruct.fromJSON(json.monster) as MonsterStruct, signature: Signature.fromJSON(json.signature) as Signature } as SignedMonsterStruct
    }
}