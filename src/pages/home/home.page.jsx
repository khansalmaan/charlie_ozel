import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorage";
import {
  getAUMValue,
  getTotalVolumeInETH,
  getTotalVolumeInUSD,
} from "../../services/web3Service";
import { useStateValue } from "../../stateManagement/stateProvider.state";
import { GOERLI_CHAIN_ID, MAINNET_CHAIND_ID } from "../../utils/constants";

import "./home.styles.scss";

function Home() {
  const [] = useLocalStorage("login");

  const [{ address }] = useStateValue();

    useEffect(() => {
      setTimeout(() => {
        try {
          window.ethereum.on("chainChanged", (chain) => {
            if (chain != MAINNET_CHAIND_ID && chain != GOERLI_CHAIN_ID) {
              return
            } else {
              // dispatch chain change
              callWeb3Service();
            }
          });
        } catch {}
      }, 500);
    }, []);

  // const [aumVol, setaumVol] = useState(0);
  // const [usdVol, setusdVol] = useState(0);
  // const [ethVol, setethVol] = useState(0);

  const [values, setValues] = useState({
  aumVol: 0,
  usdVol: 0,
  ethVol: 0,
  })

  async function callWeb3Service() {
    let usdVol = await getTotalVolumeInUSD();
    let ethVol = await getTotalVolumeInETH();
    let aumVol = await getAUMValue();

    try {
      if (aumVol.includes(".")) {
        aumVol = aumVol.split(".")[0] + "."+ aumVol.split(".")[1].slice(0, 2);
      }
      if (ethVol.includes(".")) {
        ethVol = ethVol.split(".")[0] + "."+ ethVol.split(".")[1].slice(0, 2);
      }
      if (usdVol.includes(".")) {
        usdVol = usdVol.split(".")[0] + "."+ usdVol.split(".")[1].slice(0, 2);
      }
    } catch {}

    console.log({ aumVol, usdVol, ethVol });
    
    setValues({ aumVol, usdVol, ethVol });
  }

  useEffect(() => {
    callWeb3Service();
  }, []);

  return (
    <div className="home">
      <Link to="/app" className="launch_btn">
        Launch App
      </Link>
      <div className="home_logo"></div>
      <div className="home_vol">
        <div className="vol">
          <h1>AUM (USD)</h1>
          <h2>
            {window.ethereum
              ? values.aumVol
                ? values.aumVol
                : "Loading..."
              : "Download Metamask"}
          </h2>
        </div>
        <div className="vol">
          <h1>TOTAL VOLUME (ETH) - ($)</h1>
          <h2>
            {window.ethereum
              ? values.usdVol && values.ethVol
                ? `${values.ethVol} - ${values.usdVol}`
                : "Loading..."
              : "Download Metamask"}
          </h2>
        </div>
      </div>
    </div>
  );
}

export default Home;
