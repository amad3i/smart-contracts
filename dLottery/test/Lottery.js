const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("Lottery", function () {
    let owner
    let otherAccount
    let otherAccount2
    let lottery

    beforeEach(async function(){
        [owner, otherAccount, otherAccount2] = await ethers.getSigners();
        const Lottery = await ethers.getContractFactory("Lottery", owner);
        lottery = await Lottery.deploy();
        await lottery.deployed();
    })

    it("Should to change balances", async function(){
        const tx = await lottery.connect(otherAccount).participate({value: 100})

        await expect(()=> tx)
            .to.changeEtherBalances([otherAccount, lottery], [-100, 100])

        await tx.wait()
    })

    it("Should to check percentage bet", async function(){
        const tx1 = await lottery.connect(otherAccount).participate({value: 200})
        const tx2 = await lottery.connect(otherAccount2).participate({value: 5})

        await expect(()=> tx1)
            .to.changeEtherBalances([otherAccount, lottery], [-200, 200])

        await expect(()=> tx2)
            .to.changeEtherBalances([otherAccount2, lottery], [-5, 5])
        
        await expect(
            lottery.connect(otherAccount2).participate({value: 1}))
                .to.be.revertedWith(
                    "More than 1% required from the amount of the contract"
                ) 
    })

    it("Should check last member", async function(){
        const tx2 = await lottery.connect(otherAccount2).participate({value: 100})

        await expect(()=> tx2)
            .to.changeEtherBalances([otherAccount2, lottery], [-100, 100])

        await expect(
            lottery.connect(otherAccount).reward())
                .to.be.revertedWith(
                    "You are not the last member"
                ) 
    })

    it("Should check time", async function(){
        const tx2 = await lottery.connect(otherAccount2).participate({value: 100})

        await expect(()=> tx2)
            .to.changeEtherBalances([otherAccount2, lottery], [-100, 100])

        await expect(
            lottery.connect(otherAccount2).reward())
                .to.be.revertedWith(
                    "Its not time yet"
                ) 
    })

    it("Should return rewards", async function(){
        const tx2 = await lottery.connect(otherAccount2).participate({value: 100})

        await expect(()=> tx2)
            .to.changeEtherBalances([otherAccount2, lottery], [-100, 100])
        
        await ethers.provider.send("evm_increaseTime", [24 * 60 * 60])

        await expect(lottery.connect(otherAccount2).reward())
            .to.changeEtherBalances([otherAccount2, lottery], [90, -90])
    })

  });
  