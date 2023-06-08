// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorInterface.sol";
import "./IERC6551Registry.sol";
import "./ERC6551BytecodeLib.sol";

error PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NotListed(address nftAddress, uint256 tokenId);
error AlreadyListed(address nftAddress, uint256 tokenId);
error NotOwner();
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

    address[] private oracleList = 
        [0x0d79df66BE487753B02D015Fb622DED7f0E9798d, // DAI
        0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e, // ETH
        0x48731cF7e84dc94C5f84577882c14Be11a5B7456, // LINK
        0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7];  // USDC

    address[] private tokenList = 
        [0x73967c6a0904aA032C103b4104747E88c566B1A2, // DAI
        0xdD69DB25F6D620A7baD3023c5d32761D353D3De9, // ETH
        0x326C977E6efc84E512bB9C30f76E30c160eD06FB, // LINK
        0xd35CCeEAD182dcee0F148EbaC9447DA2c4D449c4]; // USDC
    

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
        require(nft.getApproved(tokenId) == address(this), "NotApprovedForMarketplace");
        
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
        uint256 totalUsdBalance = 0;

        AggregatorInterface ethPriceFeed = AggregatorInterface(oracleList[1]);
        int256 ethPrice = ethPriceFeed.latestAnswer() / (10 ** 8); //1860usd/eth

        for (uint i = 0; i < tokenList.length; i++) {
            IERC20 tokenContract = IERC20(tokenList[i]);
            uint256 balance = tokenContract.balanceOf(tbaAccountAddress); // 0dai, 0.005eth, 1link, 0usdc 18桁増し

            AggregatorInterface priceFeed = AggregatorInterface(oracleList[i]);
            int256 priceAnswer = priceFeed.latestAnswer(); // 0usd, ?usd, ?usd, 0usd 8桁増し

            totalUsdBalance += uint256(priceAnswer) * balance / (10 ** 26);
        }

        uint256 truePriceBalance = totalUsdBalance / uint256(ethPrice);
        // truePriceBalance 0.026・・・ = $50 / 1860usd/eth
        uint256 trueEthPrice = truePriceBalance * (10 ** 18);
        //trueEthPrice 0.026・・・ = 0.026・・・ * 10 ** 18
        return trueEthPrice;
        
    }
     
}

