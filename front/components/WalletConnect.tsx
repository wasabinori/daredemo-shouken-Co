import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
    ExternalProvider,
    JsonRpcSigner,
    Network,
    Web3Provider
  } from '@ethersproject/providers';


export default function WalletConnect (): any {

    const [address, setAddress] = useState<string | null>(null);
    const [nftList, setNftList] = useState<string[]>([]);
    const [connected, setConnected] = useState<boolean>(false);

    const connectToMetamask = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Metamaskの接続リクエスト
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                // 接続されたアカウントの情報を取得
                const connectedAddress = await signer.getAddress();
                setAddress(connectedAddress);
                setConnected(true);
                console.log('Connected address:', address);
              } catch (error) {
                console.error('Failed to connect to Metamask:', error);
              }
            } else {
              console.error('Metamask not detected');
            }
        };


        const navigateToMyPage = () =>  {
            window.location.href = '/MyPage';
        };

        return (
          <div>
            {connected ? (
              <div>
                <p>Connected address: {address}</p>
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                  onClick={navigateToMyPage}
                >
                  Go to My Page
                </button>
              </div>
            ) : (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                onClick={connectToMetamask}
              >
                Connect Wallet
              </button>
            )}
          </div>
        );
      }