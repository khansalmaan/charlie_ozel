import React, { useEffect, useState } from "react";
import {
  getProxyByUser,
  getProxyPayments,
  getUserDetails,
} from "../../services/web3Service";
import { useStateValue } from "../../stateManagement/stateProvider.state";

import { v4 as uuidv4 } from "uuid";
import { ADDRESS_TO_TOKEN } from "../../utils/constants";
import Clipboard from "../clipboard/clipboard.component";

function StatsTab() {
  const [{ address }] = useStateValue();

  const [userAddresses, setuserAddresses] = useState([]);
  const [userAddressNames, setuserAddressNames] = useState([]);

  const [slippage, setslippage] = useState("");
  const [selectedAddress, setselectedAddress] = useState("");
  const [selectedAddressName, setselectedAddressName] = useState("");
  const [userToken, setuserToken] = useState("");
  const [totalPayment, settotalPayment] = useState("");

  useEffect(() => {
    if (!address) return;
    callWeb3Service();
  }, [address]);

  useEffect(() => {
    if (!selectedAddress) return;
    onAddressChange();
  }, [selectedAddress]);

  async function callWeb3Service() {
    const { 0: userAddresses, 1: userAddressNames } = await getProxyByUser(
      address
    );

    setuserAddresses([...userAddresses]);
    if (userAddresses.length) setselectedAddress(userAddresses[0]);

    setuserAddressNames([...userAddressNames]);
    if (userAddressNames.length) setselectedAddressName(userAddressNames[0]);
  }

  async function onAddressChange() {
    let payment = await getProxyPayments(selectedAddress);
   
    if (payment.includes(".")) {
      payment = payment.split(".")[0] + "." + payment.split(".")[1].slice(0, 5);
    }
    
    console.log("payment", payment);
    settotalPayment(payment);

    const userDetials = await getUserDetails(selectedAddress);
    console.log("userDetials", userDetials);

    setslippage(userDetials.userSlippage / 100);
    setuserToken(userDetials.userToken);
  }

  function handleUserAddressChange(e) {
    const addressIndex =  userAddressNames.indexOf(e.target.value);

    setselectedAddress(userAddresses[addressIndex]);
    setselectedAddressName(userAddressNames[addressIndex]);
  }

  return (
    <div className="form">
      <div className="field">
        <label>List of Accounts:</label>
        {userAddresses.length ? (
          <select
            name="tokens"
            id="tokens"
            className="defaultInput-Black limitWidth"
            value={selectedAddressName}
            onChange={handleUserAddressChange}
          >
            {userAddressNames.map((token) => (
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
      {selectedAddress && (
        <div className="field">
          <label>Raw Account:</label>
          <Clipboard textToCopy={selectedAddress} />
        </div>
      )}
      <div className="field">
        <label>Total Payments (ETH):</label>
        <input
          className={`defaultInput-Black`}
          readOnly
          type="number"
          placeholder="Payment will appear here"
          value={totalPayment}
        />
      </div>
      <div className="field">
        <label>Token Of Account:</label>
        <input
          className="defaultInput-Black"
          readOnly
          type="text"
          placeholder="User token will appear here"
          value={
            ADDRESS_TO_TOKEN[userToken]
              ? ADDRESS_TO_TOKEN[userToken]
              : userToken
          }
        />
      </div>
      <div className="field">
        <label>Slippage of Account (%):</label>
        <input
          className="defaultInput-Black"
          placeholder="Slippage will appear here"
          readOnly
          type="text"
          value={slippage}
        />
      </div>
    </div>
  );
}

export default StatsTab;
