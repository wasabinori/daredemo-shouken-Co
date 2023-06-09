import { Wallet, ethers } from 'ethers';
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import WalletConnect from '../components/WalletConnect';
import { useState } from 'react';
import contractABI from '../ContractABI.json';
//import ListNft from '../components/ListNft';



const Home: NextPage = () => {

  const [address, setAddress] = useState('');

  return (
    <div className="">
      <WalletConnect address={address} setAddress={setAddress}/>
      <div>
        {address && <p>Connected Address: {address}</p>}
      </div>

      <div>

      </div>
    </div>
  );
};

export default Home;