import { ethers } from "ethers";
import contractABI from "../ContractABI.json"
import { useState, ChangeEventHandler, FormEventHandler } from "react";

export default function ListNft () {



    const contractAddress = "0xf1028Bb2839716A86A7f27c283d440645470546b";
    const ABI: any = contractABI ;

    const [nftAddress, setNftAddress] = useState("");
    const [tokenId, setTokenId] = useState("");

    const handleNftAddressChange: ChangeEventHandler<HTMLInputElement> = ({target}) => {
        setNftAddress(target.value);
    };

    const handleTokenIdChange: ChangeEventHandler<HTMLInputElement> = ({target}) => {
        setTokenId(target.value);
    };

    const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
    };


    try {
        const { ethereum } = window;
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(
            contractAddress,
            ABI,
            signer
          );

          console.log("Going to pop wallet now to pay gas...");
          let Txn = await connectedContract.listItem(nftAddress, tokenId);
          console.log("Listing...please wait.");
          await Txn.wait();
          console.log(`Listed, see transaction: https://goerli.etherscan.io/tx/${Txn.hash}`);

        } else {
          console.log("Ethereum object doesn't exist!");
        }
     } catch (error) {
        console.log(error);
     }

     useEffect(() => {
        checkIfWalletIsConnected();
      }, []);

        return(
            <div>
                <form onSubmit={handleSubmit}>
                    <input 
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                    type="text" value={nftAddress}
                    placeholder="Write your NFTaddress here..."
                    onChange={handleNftAddressChange} />
                    <input 
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                    type="text" value={tokenId} 
                    placeholder="Write your TokenID here..."
                    onChange={handleTokenIdChange} />
                    <button 
                    type="submit"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
                    >
                        Listing!!
                    </button>
                </form>

            </div>
        );
}