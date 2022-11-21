import Web3 from 'web3';
// abis
import Ozl_ABI from "../abi/FakeOZL.json"
import StorageBeacon_ABI from "../abi/StorageBeacon.json"
import OZERC1967Proxy_ABI from "../abi/ozERC1967Proxy.json"
import OZBeaconProxy_ABI from "../abi/ozBeaconProxy.json"

import { MAINNET_CHAIND_ID } from "../utils/constants"

// providers
const arbProvider = process.env.REACT_APP_ARB_PROVIDER;
const arbProviderMainnet = process.env.REACT_APP_ARB_MAINNET_PROVIDER;

// web3 instance
const web3_arb = new Web3(new Web3.providers.HttpProvider(arbProvider));
const web3_arb_main = new Web3(new Web3.providers.HttpProvider(arbProviderMainnet));

// contracts
const OZL = new web3_arb.eth.Contract(Ozl_ABI, process.env.REACT_APP_OZL_CONTRACT);
const OZL_Main = new web3_arb_main.eth.Contract(Ozl_ABI, process.env.REACT_APP_MAINNET_OZL_CONTRACT);

const STORAGE_BEACON = process.env.REACT_APP_STORAGE_BEACON
const STORAGE_BEACON_MAIN = process.env.REACT_APP_MAINNET_STORAGE_BEACON

const OZERC1967PROXY = process.env.REACT_APP_OZERC1967PROXY
const OZERC1967PROXY_MAIN = process.env.REACT_APP_MAINNET_OZERC1967PROXY

// functions -- LANDING PAGE -- as in document
export function fromAtomicUnit(wei) {
    return Web3.utils.fromWei(wei, 'ether');
}

export async function getBlockNumber() {
    if (window.ethereum.chainId == MAINNET_CHAIND_ID) {
        return await web3_arb_main.eth.getBlockNumber();
    } else {
        return await web3_arb.eth.getBlockNumber();
    }

}

export async function getTotalVolumeInUSD() {
    if (window.ethereum.chainId == MAINNET_CHAIND_ID) {
        const res = await OZL_Main.methods.getTotalVolumeInUSD().call();
        return fromAtomicUnit(res)
    } else {
        const res = await OZL.methods.getTotalVolumeInUSD().call();
        return fromAtomicUnit(res)
    }
}

export async function getTotalVolumeInETH() {
    if (window.ethereum.chainId == MAINNET_CHAIND_ID) {
        const res = await OZL_Main.methods.getTotalVolumeInETH().call();
        return fromAtomicUnit(res)
    } else {
        const res = await OZL.methods.getTotalVolumeInETH().call();
        return fromAtomicUnit(res)
    }
}

export async function getAUMWeth() {
    if (window.ethereum.chainId == MAINNET_CHAIND_ID) {
        const res = await OZL_Main.methods.getAUM().call();
        return fromAtomicUnit(res[0])
    } else {
        const res = await OZL.methods.getAUM().call();
        return fromAtomicUnit(res[0])
    }
}

export async function getAUMValue() {
    if (window.ethereum.chainId == MAINNET_CHAIND_ID) {
        const res = await OZL_Main.methods.getAUM().call();
        return fromAtomicUnit(res[1])
    } else {
        const res = await OZL.methods.getAUM().call();
        return fromAtomicUnit(res[1])
    }
}

// functions -- APP -- as in document
export async function balanceOf(address) {

    if(!address) return;

    if (window.ethereum.chainId == MAINNET_CHAIND_ID) {
        const res = await OZL_Main.methods.balanceOf(address).call();
        return fromAtomicUnit(res)
    } else {
        const res = await OZL.methods.balanceOf(address).call();
        return fromAtomicUnit(res)
    }
}

export async function getOzelBalances(address) {

    if(!address) return

    if (window.ethereum.chainId == MAINNET_CHAIND_ID) {
        const res = await OZL_Main.methods.getOzelBalances(address).call();
        return [fromAtomicUnit(res[0]), fromAtomicUnit(res[1])]
    } else {
        const res = await OZL.methods.getOzelBalances(address).call();
        return [fromAtomicUnit(res[0]), fromAtomicUnit(res[1])]
    }
}

// functions -- WIDGET -- as in document
export async function getTokenDatabase() {
    const web3_eth = new Web3(Web3.givenProvider);
    const contractAddress = window.ethereum.chainId == MAINNET_CHAIND_ID ? STORAGE_BEACON_MAIN : STORAGE_BEACON
    const StorageBeacon = new web3_eth.eth.Contract(StorageBeacon_ABI, contractAddress);
    const res = await StorageBeacon.methods.getTokenDatabase().call();
    return res;
}

export async function getProxyByUser(address) {

    if (!address) return

    const web3_eth = new Web3(Web3.givenProvider);
    const contractAddress = window.ethereum.chainId == MAINNET_CHAIND_ID ? STORAGE_BEACON_MAIN : STORAGE_BEACON
    const StorageBeacon = new web3_eth.eth.Contract(StorageBeacon_ABI, contractAddress);
    const res = await StorageBeacon.methods.getProxyByUser(address).call();
    return res;
}

// in progress
export async function createNewProxy(address, token, slippage, accountName) {

    console.log(address, token, parseInt(slippage * 100), accountName);

    const web3_eth = new Web3(Web3.givenProvider);
    const contractAddress = window.ethereum.chainId == MAINNET_CHAIND_ID ? OZERC1967PROXY_MAIN : OZERC1967PROXY
    const OZERC1967Proxy = new web3_eth.eth.Contract(OZERC1967Proxy_ABI, contractAddress);
    const res = await OZERC1967Proxy.methods.createNewProxy([address, token, parseInt(slippage * 100), accountName]).send({ from: address });
    return res;
}

// functions -- CHANGE -- as in document
// in progress
export async function changeUserToken(selectedAccount, token, address) {
    const web3_eth = new Web3(Web3.givenProvider);
    const OZBeaconProxy = new web3_eth.eth.Contract(OZBeaconProxy_ABI, selectedAccount);
    const res = await OZBeaconProxy.methods.changeUserToken(token).send({ from: address });
    return res;
}

export async function changeUserSlippage(selectedAccount, slippage, address) {
    const web3_eth = new Web3(Web3.givenProvider);
    const OZBeaconProxy = new web3_eth.eth.Contract(OZBeaconProxy_ABI, selectedAccount);
    const res = await OZBeaconProxy.methods.changeUserSlippage(parseInt(slippage * 100)).send({ from: address });
    return res;
}

export async function changeUserTokenNSlippage(selectedAccount, token, slippage, address) {
    const web3_eth = new Web3(Web3.givenProvider);
    const OZBeaconProxy = new web3_eth.eth.Contract(OZBeaconProxy_ABI, selectedAccount);
    const res = await OZBeaconProxy.methods.changeUserTokenNSlippage(token, parseInt(slippage * 100)).send({ from: address });
    return res;
}



// functions -- STATS -- as in document
// in progress
export async function getProxyPayments(address) {

    if (!address) return

    const web3_eth = new Web3(Web3.givenProvider);
    const contractAddress = window.ethereum.chainId == MAINNET_CHAIND_ID ? STORAGE_BEACON_MAIN : STORAGE_BEACON
    const StorageBeacon = new web3_eth.eth.Contract(StorageBeacon_ABI, contractAddress);
    const res = await StorageBeacon.methods.getProxyPayments(address).call()
    return fromAtomicUnit(res);
}

export async function getUserDetails(token) {

    if (!token) return

    const web3_eth = new Web3(Web3.givenProvider);
    const OZBeaconProxy = new web3_eth.eth.Contract(OZBeaconProxy_ABI, token);
    const res = await OZBeaconProxy.methods.getUserDetails().call()
    return res;
}

export async function getTxReceipt(txHash) {

    if (!txHash) return

    const web3_eth = new Web3(Web3.givenProvider);
    return await web3_eth.eth.getTransactionReceipt(txHash);
}