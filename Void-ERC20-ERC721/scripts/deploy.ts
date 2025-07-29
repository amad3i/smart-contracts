import { ethers, run } from 'hardhat'

import { VoidNFT__factory, VoidToken__factory } from '../typechain-types'

async function main() {
  const [signer] = await ethers.getSigners()

  const voidToken = await new VoidToken__factory(signer).deploy()

  await voidToken.deployed()

  console.log('VoidToken deployed to:', voidToken.address)

  const voidNFT = await new VoidNFT__factory(signer).deploy()

  await voidNFT.deployed()

  console.log('voidNFT deployed to:', voidToken.address)

  await voidNFT.safeMint(
    signer.address,
    'https://drive.proton.me/urls/1RFWFA0EAC#0KhzE6p0ifOA'
  )

  await run('verify:verify', {
    address: voidToken.address,
    contract: 'contracts/VoidToken.sol:VoidToken'
  })

  await run('verify:verify', {
    address: voidNFT.address,
    contract: 'contracts/VoidNFT.sol:VoidNFT'
  })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})