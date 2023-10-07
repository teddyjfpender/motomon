import { MonsterStruct, SignedMonsterStruct, movesDictionary } from "@motomon/domain-model";
import { Field, Poseidon, PrivateKey, Scalar } from "snarkyjs";


export async function createMotomon() {
    const uuid = Poseidon.hash(Scalar.random().toFields());
    console.log(`uuid: ${uuid}`)
   
    const attributes = [
        movesDictionary["solar beam"],
        movesDictionary["tackle"],
        movesDictionary["scratch"],
        movesDictionary["ember"]
    ]

    const hp = Field(120);

    const monster = new MonsterStruct(uuid, attributes, hp);
    const signedMonster = new SignedMonsterStruct(monster, process.env.ORACLE_PRIVATE_KEY!)
    
    return signedMonster.toJSON();
};

