import { Wallet } from 'ethers';
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import WalletConnect from '../components/WalletConnect';


const Home: NextPage = () => {
  return (
    <div className="">
      <WalletConnect />
    </div>
  );
};

export default Home;