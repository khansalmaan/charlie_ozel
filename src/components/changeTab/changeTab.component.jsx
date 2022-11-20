import React, { useEffect, useState } from "react";
import {
  changeUserSlippage,
  changeUserToken,
  getProxyByUser,
  getTokenDatabase,
} from "../../services/web3Service";
import { useStateValue } from "../../stateManagement/stateProvider.state";

import { v4 as uuidv4 } from "uuid";
import PopUp from "../popUp/popUp.component";
import { ADDRESS_TO_TOKEN } from "../../utils/constants";

function ChangeTab() {
  const [{ address }] = useStateValue();

  const [tokenAddresses, settokenAddresses] = useState([]);
  const [userAddresses, setuserAddresses] = useState([]);

  const [newTokenCheck, setnewTokenCheck] = useState(false);
  const [newSlippageCheck, setnewSlippageCheck] = useState(false);

  const [slippage, setslippage] = useState("");
  const [selectedToken, setselectedToken] = useState("");
  const [selectedAddress, setselectedAddress] = useState("");

  const [invalidSlippage, setinvalidSlippage] = useState(false)

  const [newToken, setnewToken] = useState("");
  const [newSippage, setnewSippage] = useState("");

  const [message, setmessage] = useState("");
  const [message2, setmessage2] = useState("");

  const [showPopUp, setshowPopUp] = useState(false);

  const [sendingTx, setsendingTx] = useState(false);

  useEffect(() => {
    if (!address) return;
    callWeb3Service();
  }, [address]);

  async function callWeb3Service() {
    const tokens = await getTokenDatabase(address);
    settokenAddresses([...tokens]);

    const userAddresses = await getProxyByUser(address);
    setuserAddresses([...userAddresses]);
    if (userAddresses.length) setselectedAddress(userAddresses[0]);
  }
  function handleTokenChange(e) {
    setselectedToken(e.target.value);
  }
  function handleUserAddressChange(e) {
    setselectedAddress(e.target.value);
  }

  function enablePopUp() {
    setshowPopUp(true);
  }

  function disablePopUp() {
    setshowPopUp(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (sendingTx || invalidSlippage) return;

    console.log(selectedToken, slippage, selectedAddress);

    setsendingTx(true);

    // to delete any messages from previous tx
    setmessage2("");

    let newtoken = "";
    let newslippage = "";

    try {
      if (newTokenCheck) {
        const tx = await changeUserToken(
          selectedAddress,
          selectedToken,
          address
        );
        console.log(tx);
        newtoken = tx.events.NewUserToken.returnValues.newToken;
        setnewToken(newtoken);
        setmessage(
          ADDRESS_TO_TOKEN[newtoken]
            ? "New token successfully changed to " + ADDRESS_TO_TOKEN[newtoken]
            : "New token successfully changed to " + newtoken
        );
      }

      if (newSlippageCheck) {
        const tx = await changeUserSlippage(selectedAddress, slippage, address);
        console.log(tx);
        newslippage = +tx.events.NewUserSlippage.returnValues.newSlippage / 100;
        setnewSippage(newslippage);
        setmessage("New slippage successfully changed to " + newslippage + "%");
      }

      if (newtoken && newslippage) {
       setmessage(
         ADDRESS_TO_TOKEN[newtoken]
           ? "New token successfully changed to " + ADDRESS_TO_TOKEN[newtoken]
           : "New token successfully changed to " + newtoken
       );
        setmessage2(
          "New slippage successfully changed to " + newslippage + "%"
        );
      }

      setshowPopUp(true);
    } catch (err) {
      console.log(err.message);
    }

    setsendingTx(false);
  }

  async function handleTokenCheck() {
    setnewTokenCheck(!newTokenCheck);
  }

  async function handleSpippageCheck() {
    setnewSlippageCheck(!newSlippageCheck);
  }

  function validateSlippageInput(e) {
    setslippage(e.target.value);

    const input = parseFloat(e.target.value);

    if (!input) return;

    if (input < 0.01 || input > 5) {
      setinvalidSlippage(true);
    } else {
      setinvalidSlippage(false);
    }

    // check number of digits after decimals
    if (e.target.value.split(".")[1]?.length > 2) setinvalidSlippage(true);
  }

  return (
    <>
      {showPopUp && (
        <PopUp
          message={message}
          message2={message2}
          closePopUp={disablePopUp}
        />
      )}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Select Account:</label>
          {userAddresses.length ? (
            <select
              name="tokens"
              id="tokens"
              className="defaultInput-Black limitWidth"
              value={selectedAddress}
              onChange={handleUserAddressChange}
            >
              {userAddresses.map((token) => (
                <option key={uuidv4()} readOnly value={token}>
                  {token}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="defaultInput-Black"
              readOnly
              type="select"
              value="No account created"
            />
          )}
        </div>
        <div className={`field ${!userAddresses.length && "disable"}`}>
          <input
            className="defaultInput-Black"
            type="checkbox"
            checked={newTokenCheck}
            onChange={handleTokenCheck}
          />
          <label className={`${!newTokenCheck && "disable"}`}>New Token</label>
          {tokenAddresses.length ? (
            <select
              name="tokens"
              id="tokens"
              className={`defaultInput-Black limitWidth  ${
                !newTokenCheck && "disable"
              }`}
              value={selectedToken}
              onChange={handleTokenChange}
            >
              <option value="" disabled>
                - - Choose - -
              </option>
              {tokenAddresses.map((token) => (
                <option key={uuidv4()} readOnly value={token}>
                  {ADDRESS_TO_TOKEN[token] ? ADDRESS_TO_TOKEN[token] : token}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={`defaultInput-Black ${!newTokenCheck && "disable"}`}
              readOnly
              type="select"
              value="Fetching tokens..."
            />
          )}
        </div>
        <div className={`field ${!userAddresses.length && "disable"}`}>
          <input
            className="defaultInput-Black"
            type="checkbox"
            checked={newSlippageCheck}
            onChange={handleSpippageCheck}
          />
          <label className={`${!newSlippageCheck && "disable"}`}>
            New Slippage (%)
          </label>
          <input
            className={`defaultInput-Black ${!newSlippageCheck && "disable"} ${
              invalidSlippage && "invalid-input"
            }`}
            onChange={validateSlippageInput}
            type="number"
            placeholder="0.01-5%"
            value={slippage}
          />
        </div>
        <input
          className={`defaultInput-Black submitBtn 
          ${!newSlippageCheck && !newTokenCheck && "disable"} 
          ${invalidSlippage && "disable"} 
          ${newSlippageCheck && !slippage && "disable"}
          ${newTokenCheck && !selectedToken && "disable"}`}
          readOnly
          type="submit"
          value={sendingTx ? "Sending Transaction" : "Change Details"}
        />
      </form>
    </>
  );
}

export default ChangeTab;
