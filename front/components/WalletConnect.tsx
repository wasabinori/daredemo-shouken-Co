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
    const [connected, setConnected] = useState<boolean>(false);

    const connectToMetamask = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Metamaskの接続リクエスト
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);// 思ったように動かない原因としてここが怪しそう？
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
            window.location.href = '/MyPage'; // MyPageに遷移する関数
        };

        return (
          <div>
            {connected ? (
              <div>
                <p>Connected address: {address}</p> {/* 取得したアドレスを表示 */}
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                  onClick={navigateToMyPage} // WalletConnectしたらMyPageに遷移するボタンが出る
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