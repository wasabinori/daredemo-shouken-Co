import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
//const { developmentChains } = require("../../helper-hardhat-config")

describe("NftMarketplace", function() {
    async function deployFixture() {

        const [owner, otherAccount] = await ethers.getSigners(); 
        // Deploy the NFT contract
        const NFTContract = await ethers.getContractFactory("SimpleNft");
        const nftContract = await NFTContract.deploy();
        await nftContract.deployed();
    
        // Deploy the marketplace contract
        // const Lock = await ethers.getContractFactory("NftMarketplace");
        // const lock = await Lock.deploy();   
        // await lock.deployed();  
    
        return { nftContract,  owner, otherAccount };
      }
      //nftmint
      describe("NFTminting", function() {
        it("Shuld return collectname", async function() {
            const [owner, otherAccount] = await ethers.getSigners(); 
            const { nftContract } = await loadFixture(deployFixture);
            await nftContract.safeMint(owner, 0);

            expect(await nftContract.ownerOf(owner)).to.equal(0);
        });

        
        // it("Should return ownerAddress | tokenId 0", async function () {
        //     const { nftContract } = await loadFixture(deployFixture);
      
        //     expect(await nftContract.symbol()).to.equal("SSS");
        //   });
        });


      });