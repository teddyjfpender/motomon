import "core-js";
import "reflect-metadata";

import { TestingAppChain } from "@proto-kit/sdk";
import { PrivateKey, PublicKey, UInt64 } from "snarkyjs";
import { Balances } from "../src/Balances/Balances";
import { describe, expect, it, beforeAll } from "bun:test";


describe("Balances", () => {
  let appChain: TestingAppChain<{ Balances: typeof Balances; }>;
  let totalSupply: UInt64;
  let alicePrivateKey: PrivateKey;
  let alicePublicKey: PublicKey;
  let bobPrivateKey: PrivateKey;
  let bobPublicKey: PublicKey;
  
  beforeAll(() => {
    totalSupply = UInt64.from(10_000);

    appChain = TestingAppChain.fromRuntime({
      modules: {
        Balances,
      },
      config: {
        Balances: {
          totalSupply,
        },
      },
    });

    const PRIVATE_KEY_0 = "EKE1h2CEeYQxDaPfjSGNNB83tXYSpn3Cqt6B3vLBHuLixZLApCpd"
    const PRIVATE_KEY_1 = "EKEU31uonuF2rhG5f8KW4hRseqDjpPVysqcfKCKxqvs7x5oRviN1"

    alicePrivateKey = PrivateKey.fromBase58(PRIVATE_KEY_0);
    alicePublicKey = alicePrivateKey.toPublicKey();
    bobPrivateKey = PrivateKey.fromBase58(PRIVATE_KEY_1);
    bobPublicKey = bobPrivateKey.toPublicKey();
  })

  it("should demonstrate how balances work", async () => {

    await appChain.start();

    appChain.setSigner(alicePrivateKey);
    // this is almost equivalent to obtaining the contract ABI in solidity
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

    // send tokens to Bob
    const bobPrivateKey = PrivateKey.random();

    const tx2 = appChain.transaction(alicePublicKey, () => {
      balances.sendTo(bobPrivateKey.toPublicKey(), UInt64.from(100));
    }, { nonce: 1 });

    await tx2.sign();
    await tx2.send();

    const startTimeTx = new Date().getTime();
    const block2 = await appChain.produceBlock();
    const endTimeTx = new Date().getTime();
    console.log(`Block Production time (4 txs): ${endTimeTx - startTimeTx} milliseconds`);

    // check bob has 100 tokens
    const bobBalance = await appChain.query.runtime.Balances.balances.get(
      bobPrivateKey.toPublicKey()
    )

    expect(bobBalance?.toBigInt()).toBe(100n);
  });
});