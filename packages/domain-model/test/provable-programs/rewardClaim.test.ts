
import { Field, MerkleMap, Poseidon, PrivateKey, PublicKey, Scalar, UInt64} from "snarkyjs";
import { movesDictionary, MonsterStruct, Battle } from "../../src";
import { describe, expect, it, beforeAll } from "bun:test";

describe("Airdrop", () => {
    let airdropTree: MerkleMap;
    let airdropAmount: UInt64;
    let alicePrivateKey: PrivateKey;
    let alicePublicKey: PublicKey;
    let bobPrivateKey: PrivateKey;
    let bobPublicKey: PublicKey;
  
  beforeAll(async () => {

    const PRIVATE_KEY_0 = "EKE1h2CEeYQxDaPfjSGNNB83tXYSpn3Cqt6B3vLBHuLixZLApCpd"
    const PRIVATE_KEY_1 = "EKEU31uonuF2rhG5f8KW4hRseqDjpPVysqcfKCKxqvs7x5oRviN1"

    alicePrivateKey = PrivateKey.fromBase58(PRIVATE_KEY_0);
    alicePublicKey = alicePrivateKey.toPublicKey();
    bobPrivateKey = PrivateKey.fromBase58(PRIVATE_KEY_1);
    bobPublicKey = bobPrivateKey.toPublicKey();

    // the desired airdrop amount for bob
    airdropAmount = UInt64.from(1000);

    // populate the airdrop tree
    airdropTree = new MerkleMap();
    airdropTree.set(
      // the key is the hash of the public key
      Poseidon.hash(bobPublicKey.toFields()),
      Poseidon.hash(UInt64.from(airdropAmount).toFields())
    );
  })

  
  it("", () => {
    
    });
})