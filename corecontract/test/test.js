const { expect } = require("chai");

// テストケースの記述
describe("Market", function () {
    it("Deployment should", async function () {
        const [owner] = await ethers.getSigners();
    
        const market = await ethers.getContractFactory("Market");
    
        const testMarket = await market.deploy();

      });
  });