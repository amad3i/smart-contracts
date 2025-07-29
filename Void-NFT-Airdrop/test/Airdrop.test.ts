import { expect } from 'chai'
import { randomBytes } from 'crypto'
import { Wallet } from 'ethers'
import { ethers } from 'hardhat'
import keccak256 from 'keccak256'
import { MerkleTree } from 'merkletreejs'

import { Airdrop__factory, VoidNFT__factory } from '../typechain-types'

describe('Airdrop', () => {
  it('Full Cycle', async () => {
    const [signer, guy] = await ethers.getSigners()

    const token = await new VoidNFT__factory(signer).deploy()

    const randomAddresses = new Array(15)
      .fill(0)
      .map(() => new Wallet(randomBytes(32).toString('hex')).address)

    const merkleTree = new MerkleTree(
      randomAddresses.concat(signer.address),
      keccak256,
      { hashLeaves: true, sortPairs: true }
    )

    const root = merkleTree.getHexRoot()

    const airdrop = await new Airdrop__factory(signer).deploy(
      token.address,
      root
    )

    await token.grantRole(await token.MINTER_ROLE(), airdrop.address)

    const proof = merkleTree.getHexProof(keccak256(signer.address))
    console.log(signer.address)

    expect(await airdrop.claimed(signer.address)).to.eq(false)

    expect(await airdrop.canClaim(signer.address, proof)).to.eq(true)

    await airdrop.claim(proof)

    expect(await airdrop.claimed(signer.address)).to.eq(true)

    expect(await airdrop.canClaim(signer.address, proof)).to.eq(false)

    expect(await token.ownerOf(0)).to.eq(signer.address)

    await expect(airdrop.claim(proof)).to.be.revertedWith(
      'Airdrop: Address is not a candidate for claim'
    )

    expect(await airdrop.claimed(guy.address)).to.eq(false)

    expect(await airdrop.canClaim(guy.address, proof)).to.eq(false)

    await expect(airdrop.connect(guy).claim(proof)).to.be.revertedWith(
      'Airdrop: Address is not a candidate for claim'
    )

    const badProof = merkleTree.getHexProof(keccak256(guy.address))

    expect(badProof).to.eql([])

    expect(await airdrop.canClaim(guy.address, badProof)).to.eq(false)

    await expect(airdrop.connect(guy).claim(badProof)).to.be.revertedWith(
      'Airdrop: Address is not a candidate for claim'
    )
  })
})