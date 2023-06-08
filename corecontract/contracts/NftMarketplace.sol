// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "./lib6551/IERC6551Registry.sol";
import "./lib6551/ERC6551BytecodeLib.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorInterface.sol";
//import "./IExtendFx.sol";


//Custom Errors
error PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error ItemNotForSale(address nftAddress, uint256 tokenId);
error NotListed(address nftAddress, uint256 tokenId);
error AlreadyListed(address nftAddress, uint256 tokenId);
error NoProceeds();
error NotOwner();
error NotApprovedForMarketplace();
error PriceMustBeAboveZero();


contract NftMarketplace is ReentrancyGuard {
        struct Listing {
        uint256 price;
        address seller;
    }

    //events
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

    //価格参照結果を出す
    event CalculatePrice(
        uint256 totalPrice,
        address _tbaAddress
    );

    event priceFixed(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed tbaAccountAddress,
        uint256 price
    );

    address[] private s_listingsKeyAddress;
    uint256[] private s_listingsKeyTokenId;

        // Goerli Testnet Price Feed Address == xx / USD 
    address[] private feedAggregatorAssress = [
        0x0d79df66BE487753B02D015Fb622DED7f0E9798d, // DAI
        0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e, // ETH
        0x48731cF7e84dc94C5f84577882c14Be11a5B7456, // LINK
        0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7  // USDC
    ];

    address[] private erc20ContractAddress = [
        0x73967c6a0904aA032C103b4104747E88c566B1A2, // DAI
        0xdD69DB25F6D620A7baD3023c5d32761D353D3De9, // ETH
        0x326C977E6efc84E512bB9C30f76E30c160eD06FB, // LINK
        0xd35CCeEAD182dcee0F148EbaC9447DA2c4D449c4  // USDC
    ];



    // State Variables
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;


    // Function modifiers
    modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert AlreadyListed(nftAddress, tokenId);
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

    //….. Rest of smart contract …..


    function listItem(
        address nftAddress,
        uint256 tokenId
    )
        external
        notListed(nftAddress, tokenId, msg.sender)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        // if (price <= 0) {
        //     revert PriceMustBeAboveZero();
        // }
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NotApprovedForMarketplace();
        }

        //uint256 price = 100000;
        //initialPrice
        uint256 price = priceCalculation(nftAddress, tokenId);

        //ここでpriceを紐づけてる
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

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NotListed(nftAddress, tokenId);
        }
        _;
    }

    function buyItem(address nftAddress, uint256 tokenId)
        public
        payable
        nonReentrant
        isListed(nftAddress, tokenId)
    {
        Listing memory listedItem = s_listings[nftAddress][tokenId];

        //updatePrice
        // uint256 price = priceCalculation(nftAddress, tokenId);
        // s_listings[nftAddress][tokenId].price = price;
        //

        if (msg.value < listedItem.price) {
            revert PriceNotMet(nftAddress, tokenId, listedItem.price);
        }


        s_proceeds[listedItem.seller] += msg.value;
        delete (s_listings[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, tokenId);
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
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
        listedItem.price = priceCalculation(nftAddress, tokenId);
        emit priceFixed(nftAddress, tokenId, tbaAccountAddress, listedItem.price);

        buyItem(nftAddress, tokenId);
    }

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


    //TBAの取得
    function getAccount(
        address nftAddress,
        uint256 tokenId
    ) public view returns (address) {
        bytes32 bytecodeHash = keccak256(
            ERC6551BytecodeLib.getCreationCode(
                0x2D25602551487C3f3354dD80D76D54383A243358,
                5, //goerli chain ID
                nftAddress,
                tokenId,
                0
            )
        );

        return Create2.computeAddress(bytes32(0), bytecodeHash);
    }

    function priceCalculation(address nftAddress, uint256 tokenId) public returns (uint256 totalPrice) {
        address _tbaAddress = getAccount(nftAddress, tokenId);
        uint256 n = 0;

        AggregatorInterface dataFeed;
        while(n != feedAggregatorAssress.length) {
        IERC20 checkAddressBalance = IERC20(erc20ContractAddress[n]);
        uint256 _balance = checkAddressBalance.balanceOf(_tbaAddress);

        dataFeed = AggregatorInterface(feedAggregatorAssress[n]);

        int256 latestPrice = dataFeed.latestAnswer();
        uint256 convertPrice = uint256(latestPrice);

        //計算式
        uint256 partialPrice = _balance * convertPrice / 10000000;
        uint256 totalPrice = totalPrice + partialPrice;

        n ++;
        }
        emit CalculatePrice(totalPrice, _tbaAddress);
        return totalPrice;
    }

        function getAllNft() external view returns (
        address[] memory nftAddressList,
        uint256[] memory tokenIdList
        ) {
        nftAddressList = s_listingsKeyAddress;
        tokenIdList = s_listingsKeyTokenId;
        
        return (nftAddressList, tokenIdList);
    }

}