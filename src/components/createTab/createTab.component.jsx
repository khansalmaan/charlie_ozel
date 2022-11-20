import React, { useEffect, useState } from "react";
import {
  createNewProxy,
  getProxyByUser,
  getTokenDatabase,
} from "../../services/web3Service";
import { useStateValue } from "../../stateManagement/stateProvider.state";

import { v4 as uuidv4 } from "uuid";
import PopUp from "../popUp/popUp.component";
import { ADDRESS_TO_TOKEN } from "../../utils/constants";

function CreateTab() {
  const [{ address }] = useStateValue();

  const [tokenAddresses, settokenAddresses] = useState([]);
  const [userAddresses, setuserAddresses] = useState([]);

  const [slippage, setslippage] = useState("");
  const [selectedToken, setselectedToken] = useState("");
  const [selectedAddress, setselectedAddress] = useState("");

  const [invalidSlippage, setinvalidSlippage] = useState(false);

  const [newProxyAddress, setnewProxyAddress] = useState("");

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

    if (sendingTx) return;

    console.log(selectedToken, slippage, selectedAddress);

    setsendingTx(true);

    try {
      const tx = await createNewProxy(
        address,
        selectedToken,
        slippage,
        selectedAddress
      );

      const newProxyAddress = tx.events[0].address;

      setnewProxyAddress(newProxyAddress);

      // for fetching the latest accounts
      callWeb3Service();

      setshowPopUp(true);
    } catch (err) {
      console.log(err.message);
    }

    setsendingTx(false);
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
          message={"Account successfully created!"}
          subMessage={newProxyAddress}
          closePopUp={disablePopUp}
        />
      )}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Select Token:</label>
          {tokenAddresses.length ? (
            <select
              name="tokens"
              id="tokens"
              className="defaultInput-Black limitWidth"
              value={selectedToken}
              onChange={handleTokenChange}
            >
              <option value="" disabled >
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
              className="defaultInput-Black"
              readOnly
              type="select"
              value="No account created"
            />
          )}
        </div>
        <div className="field">
          <label>Select Slippage (%):</label>
          <input
            className={`defaultInput-Black ${
              invalidSlippage && "invalid-input"
            }`}
            onChange={validateSlippageInput}
            type="number"
            placeholder="0.01-5%"
            value={slippage}
          />
        </div>
        <div className="field">
          <label>List of Accounts:</label>
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
        <input
          className={`defaultInput-Black submitBtn 
          ${
            invalidSlippage && "disable"
          } 
          ${!slippage && "disable"}
          ${!selectedToken && "disable"}`}
          readOnly
          type="submit"
          value={sendingTx ? "Sending Transaction..." : "Create new account"}
        />
      </form>
    </>
  );
}

export default CreateTab;
