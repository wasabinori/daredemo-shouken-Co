// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorInterface.sol";
import "./IERC6551Registry.sol";
import "./ERC6551BytecodeLib.sol";
import "hardhat/console.sol";

error PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NotListed(address nftAddress, uint256 tokenId);
error AlreadyListed(address nftAddress, uint256 tokenId);
error NotOwner();
error NotApprovedForMarketplace();
error NoProceeds();

contract Market is ReentrancyGuard {
    struct Listing {
        uint256 price;
        address seller;
    }

    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCanceled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event priceFixed(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed tbaAccountAddress,
        uint256 price
    );

    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;
    

    address[] public tokenList = 
        [0xe27658a36cA8A59fE5Cc76a14Bde34a51e587ab4]; // USDC

    address[] public oracleList = 
        [0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7]; // USDC
    

    modifier notListed(
        address nftAddress,
        uint256 tokenId
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NotListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NotOwner();
        }
        _;
    }

    /////////////////////
    // Main Functions //
    /////////////////////

    function listItem(
        address nftAddress,
        uint256 tokenId
    )
        external
        notListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NotApprovedForMarketplace();
        }

        uint256 price = caluculatePrice(nftAddress, tokenId);

        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCanceled(msg.sender, nftAddress, tokenId);
    }

    function buyFlow(
        address nftAddress,
        uint256 tokenId
    )
        external
        nonReentrant
        isListed(nftAddress, tokenId)
    {
        address tbaAccountAddress = getAccount(nftAddress, tokenId);
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        listedItem.price = caluculatePrice(nftAddress, tokenId);
        emit priceFixed(nftAddress, tokenId, tbaAccountAddress,listedItem.price);

        buyItem(nftAddress, tokenId);
    }

    function buyItem(address nftAddress, uint256 tokenId)
        payable
        public
        nonReentrant
        isListed(nftAddress, tokenId)
    {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        
        if (msg.value < listedItem.price) {
            revert PriceNotMet(nftAddress, tokenId, listedItem.price);
        }

        s_proceeds[listedItem.seller] += msg.value;
        
        delete (s_listings[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, tokenId);
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
    }

    /*function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        require(success, "Transfer failed");
    }*/

    /////////////////////
    // Getter Functions //
    /////////////////////

    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }


    function getAccount(
        address nftAddress,
        uint256 tokenId
    ) public view returns (address) {
        bytes32 bytecodeHash = keccak256(
            ERC6551BytecodeLib.getCreationCode(
                0x2D25602551487C3f3354dD80D76D54383A243358,
                11155111,
                nftAddress,
                tokenId,
                0
            )
        );

        return Create2.computeAddress(bytes32(0), bytecodeHash);
    }

    function caluculatePrice(
        address nftAddress,
        uint256 tokenId
    ) public view returns (uint256){
        address tbaAccountAddress = getAccount(nftAddress, tokenId);
        uint256 totalBalance = 0;
        uint256 balance = 0;
        int256 priceAnswer = 0;

        for (uint i = 0; i < tokenList.length; i++) {
            IERC20 tokneContract = IERC20(tokenList[i]);
            balance = tokneContract.balanceOf(tbaAccountAddress);

            AggregatorInterface priceFeed = AggregatorInterface(oracleList[i]);
            priceAnswer = priceFeed.latestAnswer();
            
            totalBalance += uint256(priceAnswer) * balance / (10 ** 8);
        }
        
        return totalBalance;
        
    }
    
}

