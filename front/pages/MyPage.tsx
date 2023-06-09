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
            if (typeof window.ethereum === 'undefined') {
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
                <div>
                    {item.totalCount > 0 && (
                        <div>
                            {item.ownedNfts.map((item, index) => (
                                <div key={index}>
                                    <div>NFT: {index + 1}</div>
                                    <div>Title:「{item.title}」</div>
                                    <div>TokenID: {item.tokenId}</div>
                                    <div>Address: {item.contract.address}</div>
                                    <div>Description:「{item.description}」</div>
                                    <div>Balance: {item.balance}</div>
                                    <br />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            ))}
        </div>
    );
};

export default Mypage;