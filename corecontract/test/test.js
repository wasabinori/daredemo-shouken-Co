const { assert, expect } = require("chai")

describe("Nft Marketplace Unit Tests", function () {
  const PRICE = ethers.utils.parseEther("0.1")
  const TOKEN_ID = 0

  it("Should list an item", async function (){
      accounts = await ethers.getSigners() // could also do with getNamedAccounts
      deployer = accounts[0]
      user = accounts[1]
      user2 = accounts[2]
      const amount = ethers.utils.parseEther("3"); 
      await deployer.sendTransaction({
        to: user2.address,
        value: amount
    });

      const balance2 = await ethers.provider.getBalance(user2.address);
      console.log("user2Balance: ", balance2)

      const marketContract = await ethers.getContractFactory("Market")
      const testNftMarketplace = await marketContract.deploy()

      

      const basicNftContract = await ethers.getContractFactory("BasicNft")
      const basicNft = await basicNftContract.deploy()

      await basicNft.deployed()
      
      //NFTをmint
      await basicNft.connect(user).mintNft()

      await testNftMarketplace.deployed()

      const tbaAddress = await testNftMarketplace.getAccount(basicNft.address, TOKEN_ID)
      await deployer.sendTransaction({
        to: tbaAddress,
        value: amount
    });

      const balance3 = await ethers.provider.getBalance(tbaAddress);
      console.log("tbaBalance: ", balance3)
      //NFTをマーケットプレイスに登録
      expect(await basicNft.balanceOf(user.address)).to.equal(1)
      const _balance = await basicNft.balanceOf(user.address)
      console.log("balance: ", _balance.toString())

      await basicNft.connect(user).approve(testNftMarketplace.address, TOKEN_ID)
      const answer = await basicNft.getApproved(0)
      console.log("answer: ", answer)

      const result = await testNftMarketplace.getAccount(basicNft.address, TOKEN_ID)
      console.log("result: ", result)

      

      expect(await testNftMarketplace.connect(user).listItem(basicNft.address, TOKEN_ID)).to.emit(testNftMarketplace, "ItemListed")
      
      const result2 = await testNftMarketplace.getListing(basicNft.address, TOKEN_ID)
      console.log("result2: ", result2)

      await testNftMarketplace.connect(user2).buyItem(basicNft.address, TOKEN_ID, {value: "9740734408076860"})
      const result3 = await testNftMarketplace.getListing(basicNft.address, TOKEN_ID)
      console.log("result3: ", result3)

      const balance5 = await ethers.provider.getBalance(user2.address);
      console.log("user2Balance: ", balance5)

      const a = 3000000000000000000 * 598178500;
      console.log("a: ", a);

      const b = a / 184230000000;
      console.log("b: ", b);

      const c = await testNftMarketplace.caluculatePrice(basicNft.address, 0)
      console.log("c: ", c)

 
  })
})


