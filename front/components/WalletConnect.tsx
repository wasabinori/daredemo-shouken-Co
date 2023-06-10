import contractABI from "../ContractABI.json"
import { useState, ChangeEventHandler, FormEventHandler } from "react";
import { ethers } from "ethers";


export default function WalletConnect ({address, setAddress} :any ): any {



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
      

      //listItem関数呼び出し
        const [nftAddress, setNftAddress] = useState("");
        const [tokenId, setTokenId] = useState<number>();
        const [nftABI, setNftABI] = useState("");
  
        const handleNftAddressChange: ChangeEventHandler<HTMLInputElement> = ({target}) => {
        setNftAddress(target.value);
        };
  
        const handleTokenIdChange: ChangeEventHandler<HTMLInputElement> = ({target}) => {
        setTokenId(Number(target.value));
        };
  
        const handleNftABIChange: ChangeEventHandler<HTMLInputElement> = ({target}) => {
        setNftABI(target.value);
        };
  
        const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        };
    

        //BuyNft関数呼び出し
      const [buyNftAddress, setBuyNftAddress] = useState("");
      const [buyTokenId, setBuyTokenId] = useState<number>();

      const handleBuyNftAddressChange: ChangeEventHandler<HTMLInputElement> = ({target}) => {
      setBuyNftAddress(target.value);
      };

      const handleBuyTokenIdChange: ChangeEventHandler<HTMLInputElement> = ({target}) => {
      setBuyTokenId(Number(target.value));
      };

      const handleBuySubmit: FormEventHandler<HTMLFormElement> = (event) => {
      event.preventDefault();
      };



      const listNft = async () => {
        const contractAddress = "0x07Df80b689fbaFE02F48e364ECEA95aD9562A638";
        const ABI: any = contractABI ;

        try {
            const { ethereum } = window;
            if (ethereum) {
              const provider = new ethers.providers.Web3Provider(ethereum);
              const signer = provider.getSigner();
              const connectedContract = new ethers.Contract(
                contractAddress,
                ABI.abi,
                signer
              );

              const _nftABI = JSON.parse(nftABI);
              const nftContract = new ethers.Contract(nftAddress, _nftABI, signer);


              console.log("Going to pop wallet now to pay gas...");
              const gasLimit = 300000; // ガス制限の値を適切に設定
                
              console.log("Approve NFT to Market contract...");
              let firstTxn = await nftContract.approve(contractAddress, tokenId, { gasLimit });
              console.log("Approving...please wait.");
              
              await firstTxn.wait();
              console.log(
                `Approved, see transaction: https://goerli.etherscan.io/tx/${firstTxn.hash}`
              );

              let mainTxn = await connectedContract.listItem(nftAddress, tokenId, { gasLimit });
              console.log("Listining...please wait.");
              await mainTxn.wait();
              console.log(
                `Listed, see transaction: https://goerli.etherscan.io/tx/${mainTxn.hash}`
              );
            } else {
              console.log("Ethereum object doesn't exist!");
            }
          } catch (error) {
            console.log(error);
          }
        }

      const BuyNft = async () => {
        const contractAddress = "0x07Df80b689fbaFE02F48e364ECEA95aD9562A638";
        const ABI: any = contractABI ;

        try {
          const { ethereum } = window;
          if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const connectedContract = new ethers.Contract(
              contractAddress,
              ABI.abi,
              signer
            );

            
            console.log("Going to pop wallet now to pay gas...");
            const gasLimit = 30000000; // ガス制限の値を適切に設定

            let firstTxn = await connectedContract.caluclatePrice(buyNftAddress, buyTokenId, { gasLimit });
            console.log("Price Caluclating...please wait.");
            await firstTxn.wait();
            console.log(
              `Price Update, see transaction: https://goerli.etherscan.io/tx/${firstTxn.hash}`
            );

            // let secondTxn = await connectedContract.(nftAddress, tokenId, { gasLimit });
            // console.log("Price updating...please wait.");
            // await secondTxn.wait();
            // console.log(
            //   `Listed, see transaction: https://goerli.etherscan.io/tx/${secondTxn.hash}`
            // );


            let mainTxn = await connectedContract.buyItem(buyNftAddress, buyTokenId, { gasLimit });
            console.log("Listining...please wait.");
            await mainTxn.wait();
            console.log(
              `YOU Get NFT, see transaction: https://goerli.etherscan.io/tx/${mainTxn.hash}`
            );

          } else {
            console.log("Ethereum object doesn't exist!");
          }
        } catch (error) {
          console.log(error);
        }
      }

    return(
    <div>
        {/* haeder */}
        <div className="max-w-6xl mx-auto OutermostBox sticky  justify-between shadow-lg px-2 py-2">
            <div className="flex flex-row gap-x-5 gap-y-20">
                <h1 className='font-sans font-medium text-5xl'>6551marketplace</h1>
                <button 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                onClick={connectToMetamask}
                >
                connect wallet
                </button>
            </div>

          {/* listitem */}
        </div>
          <form onSubmit={handleSubmit}>
            <input 
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            type="text" value={nftAddress}
            placeholder="Write your NFTaddress here..."
            onChange={handleNftAddressChange} />
            <input 
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            type="number" value={tokenId} 
            placeholder="Write your TokenID here..."
            onChange={handleTokenIdChange} />

            <input 
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            type="text" value={nftABI}
            placeholder="Write your NFT ABI here..."
            onChange={handleNftABIChange} />

            <button 
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={listNft}
            >
                Listing!!
            </button>
          </form>
        <div>
          {/* 一行あけたい */}
          <div></div>
        </div>

        {/* BuyNft */}

        <form onSubmit={handleBuySubmit}>
            <input 
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            type="text" value={buyNftAddress}
            placeholder="Enter the NFT address where you plan to purchase here..."
            onChange={handleBuyNftAddressChange} />

            <input 
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            type="number" value={buyTokenId} 
            placeholder="TokenID here..."
            onChange={handleBuyTokenIdChange} />

            <button 
            type="submit"
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={BuyNft}
            >
                BuyNFT!!
            </button>
          </form>

        <div>
        </div>
    </div>
    );
}