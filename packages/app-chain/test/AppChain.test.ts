import "core-js";
import "reflect-metadata";

import { PrivateKey, PublicKey, UInt64 } from "snarkyjs";
import { MotomonChain } from "../src/AppChain";
import { describe, expect, it, beforeAll } from "bun:test";

describe("Monster", () => {
    let chain: MotomonChain;
    let totalSupply: UInt64;
    let alicePrivateKey: PrivateKey;
    let alicePublicKey: PublicKey;
    let oraclePrivateKey: PrivateKey;
    let oraclePublicKey: PublicKey;

    beforeAll(() => {
        const PRIVATE_KEY_0 = "EKE1h2CEeYQxDaPfjSGNNB83tXYSpn3Cqt6B3vLBHuLixZLApCpd";
        const PRIVATE_KEY_1 = "EKEU31uonuF2rhG5f8KW4hRseqDjpPVysqcfKCKxqvs7x5oRviN1";

        totalSupply = UInt64.from(10_000);

        alicePrivateKey = PrivateKey.fromBase58(PRIVATE_KEY_0);
        alicePublicKey = alicePrivateKey.toPublicKey();
        oraclePrivateKey = PrivateKey.fromBase58(PRIVATE_KEY_1);
        oraclePublicKey = oraclePrivateKey.toPublicKey();

        chain = MotomonChain.create({
            Monsters: {
                oraclePublicKey,
            },
            Balances: {
                totalSupply,
            }
        });
    });

    it("should demonstrate how to mint a monster", async () => {
        await chain.chainInstance.start();

        chain.setSigner(alicePrivateKey);

        const tx1 = chain.chainInstance.transaction(alicePublicKey, () => {
            // this is almost equivalent to obtaining the contract ABI in solidity
            const balances = chain.chainInstance.runtime.resolve("Balances");
            balances.setBalance(alicePublicKey, UInt64.from(1000));
        });

        await tx1.sign();
        await tx1.send();

        const startTime = new Date().getTime();
        const block1 = await chain.produceBlock();
        const endTime = new Date().getTime();
        console.log(`Block Production time: ${endTime - startTime} milliseconds`);

        const aliceBalance = await chain.request("motomon_getBalance", { address: alicePublicKey });

        expect(block1?.txs[0].status).toBe(true);
        expect(aliceBalance?.toBigInt()).toBe(1000n);
    });
});
