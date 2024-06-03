import React, { useState } from "react";
import "./connectWallet.css";
// import { LazyLoadImage } from 'react-lazy-load-image-component';
import { CenterLayout } from "../../components/layout";
import { ButtonWithAction, ButtonWithNavigation, DisabledButton } from "../../components/button";
import { store } from "../../redux/reducer";
import { walletSlice } from "../../redux/wallet";
import { DeeplinkableWallet, GenericExtensionWallet } from "@signumjs/wallets";
import { Address, Ledger } from "@signumjs/core";
import { accountId, userAccount } from "../../redux/account";
import { accountSlice } from "../../redux/account";
import { useContext } from "react";
import { AppContext } from "../../redux/useContext";
import { useNavigate } from "react-router-dom";
import { LedgerClientFactory } from "@signumjs/core";
import { profileSlice } from "../../redux/profile";
import { CheckUnconfirmedNewNFTContract } from "../myNftList/checkNewContract";
import { CheckUnconfirmedNewBMIContract } from "../myNftList/checkNewContract";
import { Link } from "react-router-dom";
import { contractSlice } from "../../redux/contract";
import axios from "axios";
import { checkEquippedBettermiNFT } from "../../NftSystem/UserLevel/checkUserLevel";
import { UpdateUserIconNewVersion } from "../../NftSystem/updateUserNftStorage";
import { FindLatestTransactionNumber } from "../../NftSystem/updateUserNftStorage";
import { FindLatestTransactionArray } from "../../NftSystem/updateUserNftStorage";
import { connectWallet } from "../../NftSystem/connectWallet/connectWallet";

export interface IConnectWalletProps {}

export default function ConnectWallet(props: IConnectWalletProps) {
  localStorage.clear(); //Guess we need to clear out all local storage after connecting account
  const navigate = useNavigate();
  const { appName, Wallet, Ledger } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const codeHashId = process.env.REACT_APP_BMI_MACHINE_CODE_HASH!.replace('"', "");
  const codeHashIdForNft = process.env.REACT_APP_NFT_MACHINE_CODE_HASH!.replace('"', ""); // the code hash of the NFT contract
  const assetId = process.env.REACT_APP_TOKEN_ID!.replace('"', "");
  const nftDistributor = process.env.REACT_APP_NFT_DISTRIBUTOR!.replace('"', "");
  store.dispatch({ type: "USER_LOGOUT" });

  const userConnectWallet = async (appName: any, Wallet: any, Ledger: any,codeHashId:string,codeHashIdForNft:string,assetId:string,navigate:any) => {
  
    try{
        const userInfo = await connectWallet(appName, Wallet, Ledger,codeHashId,codeHashIdForNft,assetId);
        if(userInfo == null){
          alert("seems like an error has occured. We would be grateful if you could report to core team at discord")
        }



        console.log("userInfo is ",userInfo)
        // if both contract is created
        if ((userInfo!.openedBmiContract === true && userInfo!.userNftStorage.ats[0]) || (userInfo!.userBMIStorage.ats[0] != null && userInfo!.openedNftContract === true)) {
          navigate("/loadingMinting");
          return;
        }

        if (userInfo!.userBMIStorage.ats[0] != null && userInfo!.userNftStorage.ats[0] != null) {
          store.dispatch(accountSlice.actions.setNftContractStorage(userInfo!.userNftStorage.ats[0].at));

          var description = userInfo!.userBMIStorage.ats[0].description;

          if (description.includes("Female") === true) {
            store.dispatch(profileSlice.actions.setGender("Female"));
          } else if (description.includes("Male") === true) {
            store.dispatch(profileSlice.actions.setGender("Male"));
          } else {
            store.dispatch(profileSlice.actions.setGender("Male"));
          }
          navigate("/home");
        } else {
          navigate("/connectSucceed");
        }
    }
      // todo: add error handling, and show it to user
      catch(error: any) {
        if (error.name === "InvalidNetworkError") {
          alert(
            "It looks like you are not connecting to the correct signum node in your XT-Wallet, currently in our beta version we are using Europe node, please change your node to Europe node and try again",
          );
        }
        if (error.name === "NotFoundWalletError") {
          window.location.href = "https://chrome.google.com/webstore/detail/signum-xt-wallet/kdgponmicjmjiejhifbjgembdcaclcib/";
        }
      }
  };

  const guestExplore = (): void => {

    navigate("/home");
  }

  const logo: JSX.Element = (
    <div className="connectWallet-bg-img-container">
      {/* {isLoading && <img className="connectWallet-bg-img" src={process.env.PUBLIC_URL + "/img/connectWallet/freeze_bettermi_logo.png"} />} */}
      <img 
        className="connectWallet-bg-img" 
        src={process.env.PUBLIC_URL + "/img/connectWallet/Bettermi.io_dAPP_Landing_Animation_compassed_addition_ver2.gif"} 
        onLoad={() => setIsLoading(false)} 
        style={{ display: isLoading ? 'none' : 'inline-block' }}  
      />
    </div>
  );

  const content: JSX.Element = (
    <div className="connectWallet-layout" >
      {logo}
      <div id="connectWallet-container">
        {/* {logo} */}
        <div className="connectWallet-option-container">
          <div id="connectWallet-button-container">
            <ButtonWithAction
              text="XT wallet"
              action={() => {
                userConnectWallet(appName, Wallet, Ledger,codeHashId,codeHashIdForNft,assetId,navigate);
              }} // TODO: add action to connect wallet
              height="56px"
              width="248px"
            />
            <Link to="https://phoenix-wallet.rocks/">
              <DisabledButton text="Phoenix wallet" height="56px" width="248px" />
            </Link>
          </div>
          <p className="inter-normal-white-15px">or</p>
          <div className="inter-semi-bold-keppel-15px guest-explore-button" onClick={() => navigate("/home")}>
            Explore as a guest
          </div>
        </div>
      </div>
    </div>
  );

  return content;
  // return <CenterLayout bgImg={false} content={content} />;
}
