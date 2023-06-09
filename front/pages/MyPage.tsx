import React, { useEffect, useState } from 'react';
import { Network, initializeAlchemy, getNftsForOwner, OwnedNftsResponse } from "@alch/alchemy-sdk";


const Mypage = () => {
    const [connected, setConnected] = useState(false);
    const [address, setAddress] = useState('');
    const [NFTs, setNFTs] = useState<OwnedNftsResponse[]>([]);

const fetchData = async () => {
    const settings = {
        apikey: "0pKIAXtqho6DikSSdbB-QuyB1dyjwfCy",
        network: Network.ETH_GOERLI,
        maxRetries: 10,
    };
    const alchemy = initializeAlchemy(settings);
    // 接続されたアカウントの情報を取得
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    setAddress(accounts[0]);
    const tmpNFTs = await getNftsForOwner(alchemy, accounts[0]);

    setNFTs([tmpNFTs]);
};


    useEffect(() => {
        const checkWalletConnection = async () => {
            // Walletが接続されているかを確認する処理
            if (typeof window.ethereum !== 'undefined') {
                try {
                    // MetamaskなどのEthereumプロバイダに接続を試みる
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    setConnected(true);
                    fetchData();
                } catch (error) {
                    console.error('Failed to connect to Metamask:', error);
                }
            }
        };
        // ここに接続確認のコードを追加します
        checkWalletConnection();
    }, []);

    if (!connected) {
        // Walletが接続されていない場合の処理
        return <div>Please connect to wallet</div>;
    }

    return (
        <div>
            <h1>{address}</h1>
            {Array.isArray(NFTs) && NFTs.map((item, index) => (
            <div key={index}>
                {item.totalCount === 0 && <div>You have no NFT.</div>}
                {item.totalCount === 1 && <div>You have 1 NFT.</div>}
                {item.totalCount >= 2 && <div>You have {item.totalCount} NFTs.</div>}
                <div>pageKey:{item.pageKey}</div>
                <div>balance: {item.ownedNfts[0].balance}</div>
                <div>Contract.address: {item.ownedNfts[0].contract.address}</div>
                <div>Contract.address: {item.ownedNfts[1].contract.address}</div>
                <div>description: {item.ownedNfts[0].description}</div>
                <div>timeLastUpdated: {item.ownedNfts[0].timeLastUpdated}</div>
                <div>Title: {item.ownedNfts[0].title}</div>
                <div>tokenId: {item.ownedNfts[0].tokenId}</div>
                <div>tokenType: {item.ownedNfts[0].tokenType}</div>
            </div>
            ))}
        </div>
    );
};

export default Mypage;
