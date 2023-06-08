const { expect } = require("chai");

// テストケースの記述
/*describe("Market", function () {
    it("Deployment should", async function () {
        const [owner] = await ethers.getSigners();
    
        const market = await ethers.getContractFactory("Market");
    
        const testMarket = await market.deploy();

      });
  });*/

  describe("Marketのテスト", function () {
    it("caluculatePriceのテスト", async function () {
        const market = await ethers.getContractFactory("Market");
        const [owner, addr1] = await ethers.getSigners();
        const testMarket = await market.deploy();
    });
  });