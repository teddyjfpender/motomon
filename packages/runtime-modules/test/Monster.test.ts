import "core-js";
import "reflect-metadata";

import { TestingAppChain } from "@proto-kit/sdk";
import { Field, Poseidon, PrivateKey, PublicKey, Scalar, UInt64 } from "snarkyjs";
import { movesDictionary, MonsterStruct, SignedMonsterStruct } from "@motomon/domain-model";
import { Monsters } from "../src/Monsters/Monsters";
import { Balances } from "../src/Balances/Balances";
import { describe, expect, it, beforeAll } from "bun:test";

describe("Monster", () => {
  let appChain: TestingAppChain<{ Monsters: typeof Monsters; Balances: typeof Balances}>;
  let totalSupply: UInt64;
  let alicePrivateKey: PrivateKey;
  let alicePublicKey: PublicKey;
  let oraclePrivateKey: PrivateKey;
  let oraclePublicKey: PublicKey;
  
  beforeAll(() => {
    const PRIVATE_KEY_0 = "EKE1h2CEeYQxDaPfjSGNNB83tXYSpn3Cqt6B3vLBHuLixZLApCpd"
    const PRIVATE_KEY_1 = "EKEU31uonuF2rhG5f8KW4hRseqDjpPVysqcfKCKxqvs7x5oRviN1"

    totalSupply = UInt64.from(10_000);

    alicePrivateKey = PrivateKey.fromBase58(PRIVATE_KEY_0);
    alicePublicKey = alicePrivateKey.toPublicKey();
    oraclePrivateKey = PrivateKey.fromBase58(PRIVATE_KEY_1);
    oraclePublicKey = oraclePrivateKey.toPublicKey();

    appChain = TestingAppChain.fromRuntime({
      modules: {
        Monsters,
        Balances
      },
      config: {
        Monsters: {
            oraclePublicKey,
        },
        Balances: {
          totalSupply,
        },
      },
    });
  })

  it("should demonstrate how to mint a monster", async () => {

    await appChain.start();

    appChain.setSigner(alicePrivateKey);

    // this is almost equivalent to obtaining the contract ABI in solidity
    const monsters = appChain.runtime.resolve("Monsters");
    const balances = appChain.runtime.resolve("Balances");

    const tx1 = appChain.transaction(alicePublicKey, () => {
      balances.setBalance(alicePublicKey, UInt64.from(1000));
    });

    await tx1.sign();
    await tx1.send();

    const startTime = new Date().getTime();
    const block1 = await appChain.produceBlock();
    const endTime = new Date().getTime();
    console.log(`Block Production time: ${endTime - startTime} milliseconds`);

    const aliceBalance = await appChain.query.runtime.Balances.balances.get(
      alicePublicKey
    );

    expect(block1?.txs[0].status).toBe(true);
    expect(aliceBalance?.toBigInt()).toBe(1000n);

    /**
     * Generate a random monster and sign it with the oracle's private key.
     */
    // unique identifier for the monster
    const uuid = Poseidon.hash(Scalar.random().toFields());
    // monster attributes
    const attributes = [
      movesDictionary["solar beam"],
      movesDictionary["tackle"],
      movesDictionary["scratch"],
      movesDictionary["ember"]
    ]
    // monster health points
    const hp = Field(120);
    // create the monster
    const monster = new MonsterStruct(uuid, attributes, hp);
    // sign the monster with the oracle's private key
    const signedMonster = new SignedMonsterStruct(monster, oraclePrivateKey.toBase58());
    // verify the signature
    const verified = signedMonster.signature.verify(
      oraclePublicKey,
      monster.fieldRepresentation
    );
    expect(verified.toBoolean()).toBe(true);
    /**
     * Once Alice has received the signed monster, she can mint it.
     */
    console.log("Minting monster...")
    const tx2 = appChain.transaction(alicePublicKey, () => {
        monsters.mintMonster(alicePublicKey, signedMonster);
    }, {nonce: 1});

    console.log("Signing transaction...")
    await tx2.sign();
    console.log("Sending transaction...")
    await tx2.send();

    const startTime_ = new Date().getTime();
    const block2 = await appChain.produceBlock();
    const endTime_ = new Date().getTime();
    console.log(`Block Production time: ${endTime_ - startTime_} milliseconds`);

    const aliceMonster = await appChain.query.runtime.Monsters.monsterRegistry.get(
      alicePublicKey
    );

    expect(block1?.txs[0].status).toBe(true);
    expect(aliceMonster?.hp.toBigInt()).toBe(120n);
  });
});