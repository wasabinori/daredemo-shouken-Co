import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
    ExternalProvider,
    JsonRpcSigner,
    Network,
    Web3Provider
  } from '@ethersproject/providers';


// declare global {
// interface Window {
//     ethereum?: ethers.providers.ExternalProvider;
//     }
// }

export default function WalletConnect (): any {
    const connectToMetamask = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Metamaskの接続リクエスト
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                // 接続されたアカウントの情報を取得
                const address = await signer.getAddress();
                console.log('Connected address:', address);
              } catch (error) {
                console.error('Failed to connect to Metamask:', error);
              }
            } else {
              console.error('Metamask not detected');
            }
        }


    return(
        <div>
            <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={connectToMetamask}
            >
            connect wallet
            </button>
        </div>
    );
}