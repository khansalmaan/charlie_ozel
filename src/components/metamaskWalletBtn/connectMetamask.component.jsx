import React, { useEffect, useState } from "react";

import "./connectMetamask.style.scss";

import { toast } from "react-toastify";
import { useStateValue } from "../../stateManagement/stateProvider.state";
import PopUp from "../popUp/popUp.component";

export default function MetamaskWalletBtn({ enablePopUp }) {
  const [{ address }, dispatch] = useStateValue();
  const [isLoading, setisLoading] = useState(false);
  const [showPopUp, setshowPopUp] = useState(false);
  const [message, setmessage] = useState("");

  const accountChangeHandler = async (account) => {
    dispatch({
      type: "METAMASK_ADDRESS",
      payload: account,
    });

    setisLoading(false);
  };

  function connectMetamaskHandler() {
    if (isLoading) return;
    setisLoading(true);

    if (window.ethereum) {
      // res[0] for fetching a first wallet
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((res) => accountChangeHandler(res[0]));

      window.ethereum.on("accountsChanged", (accounts) => {
        accountChangeHandler(accounts[0]);
      });
    } else {
      enablePopUp(true);
      setisLoading(false);
    }
  }

  function disconnectMetamaskHandler() {
    dispatch({
      type: "DISCONNECT",
      payload: "",
    });

    toast.success("Sign out successfully.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    // window.location.reload(true);
  }

  // function disablePopUp() {
  //   setshowPopUp(false);
  // }

  return (
    <>
      {/* {showPopUp && ( 
        <PopUp
          message={message}
          closePopUp={disablePopUp}
        />
      )} */}
      <div className={`metamask__btnContainer`}>
        {address ? (
          <div
            className="metamask__connectBtn metamask__Btn"
            onClick={disconnectMetamaskHandler}
          >
            Disconnect: {address.slice(0, 5)}...{address.slice(-5)}
          </div>
        ) : (
          <div
            className="metamask__connectBtn metamask__Btn"
            onClick={connectMetamaskHandler}
          >
            {isLoading ? "Loggin in..." : "Connect Metamask"}
          </div>
        )}
      </div>
    </>
  );
}
