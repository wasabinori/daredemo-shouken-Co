import React, { useEffect, useState } from 'react';

const Mypage = () => {
    const [connected, setConnected] = useState(false);
    const [address, setAddress] = useState('');
    const [nfts, setNFTs] = useState([]);

    useEffect(() => {
        const checkWalletConnection = async () => {
            // Walletが接続されているかを確認する処理
            if (typeof window.ethereum !== 'undefined') {
                try {
                    // MetamaskなどのEthereumプロバイダに接続を試みる
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    setConnected(true);
                    // 接続されたアカウントの情報を取得
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    setAddress(accounts[0]);
                    
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
        <h1>アドレス: {address}</h1>
        <h2>所持しているNFT一覧:</h2>
        
    </div>
    );
};

export default Mypage;
