import { Experimental, Field, MerkleMap, MerkleMapWitness, Poseidon, Provable, PublicKey, Struct, UInt64 } from "snarkyjs";

export class AirdropProgramPublicOutput extends Struct({
    commitment: Field,
    amount: UInt64,
}) {}

export function getWitness(airdropTree: MerkleMap, key: Field) {
    return Provable.witness(MerkleMapWitness, () => airdropTree.getWitness(key));
}

/**
 * Function for proving an address is eligible to claim an amount from the airdrop,
 * by linking the address & amount to the airdrop tree via a merkle witness.
 */
export function canClaim(address: PublicKey, witness: MerkleMapWitness, airdropAmount: UInt64) {
    const key = Poseidon.hash(address.toFields());
  
    const value = Provable.witness(UInt64, () => airdropAmount);
  
    const [computedRoot, computedKey] = witness.computeRootAndKey(
      Poseidon.hash(value.toFields())
    );
  
    key.assertEquals(
      computedKey,
      "Computed key from witness does not match the required key"
    );
  
    return new AirdropProgramPublicOutput({
      commitment: computedRoot,
      amount: value,
    });
  }
  
// ZkProgram for proving an address is eligible to claim an amount from the airdrop,
export const AirdropProgram = Experimental.ZkProgram({
    publicOutput: AirdropProgramPublicOutput,
    methods: {
      isEligible: {
          privateInputs: [PublicKey, MerkleMapWitness, UInt64],
          method: canClaim,
        },
    },
});

export class AirdropProof extends Experimental.ZkProgram.Proof(AirdropProgram) {}
