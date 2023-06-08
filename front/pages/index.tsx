import { Wallet } from 'ethers';
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import WalletConnect from '../components/WalletConnect';


const Home: NextPage = () => {
  return (
    <div className="">
      <h1 className='font-sans font-medium text-5xl'>6551marketplace</h1>
      <WalletConnect />
    </div>
  );
};

export default Home;