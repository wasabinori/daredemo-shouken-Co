import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function WalletConnect (): any {

    const [address, setAddress] = useState('');

    const connectToMetamask = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Metamaskの接続リクエスト
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
        
                // 接続されたアカウントの情報を取得
                const address = await signer.getAddress();
                setAddress(address);
                console.log('Connected address:', address);
              } catch (error) {
                console.error('Failed to connect to Metamask:', error);
              }
            } else {
              console.error('Metamask not detected');
            }
        }


    return(
        <div className="max-w-6xl mx-auto OutermostBox sticky flex flex-row justify-between shadow-lg px-2 py-2">
            <div className="">
                <h1 className='font-sans font-medium text-5xl'>6551marketplace</h1>
                <button 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                onClick={connectToMetamask}
                >
                connect wallet
                </button>
                {address && <p>Connected Address: {address}</p>}
            </div>
        </div>
    );
}