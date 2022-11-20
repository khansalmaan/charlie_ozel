import Web3 from 'web3';
// abis
import Ozl_ABI from "../abi/FakeOZL.json"
import StorageBeacon_ABI from "../abi/StorageBeacon.json"
import OZERC1967Proxy_ABI from "../abi/ozERC1967Proxy.json"
import OZBeaconProxy_ABI from "../abi/ozBeaconProxy.json"

// providers
const arbProvider = process.env.REACT_APP_ARB_PROVIDER;
// const ethProvider = process.env.REACT_APP_ETH_PROVIDER

// web3 instance
const web3_arb = new Web3(new Web3.providers.HttpProvider(arbProvider));
const web3_eth = new Web3(Web3.givenProvider)

// contracts
const OZL = new web3_arb.eth.Contract(Ozl_ABI, process.env.REACT_APP_OZL_CONTRACT);
const StorageBeacon = new web3_eth.eth.Contract(StorageBeacon_ABI, process.env.REACT_APP_STORAGE_BEACON);
const OZERC1967Proxy = new web3_eth.eth.Contract(OZERC1967Proxy_ABI, process.env.REACT_APP_OZERC1967PROXY);

// functions -- LANDING PAGE -- as in document
export function fromAtomicUnit(wei) {
    return Web3.utils.fromWei(wei, 'ether');
}

export async function getBlockNumber() {
    return await web3_arb.eth.getBlockNumber()
}

export async function getTotalVolumeInUSD() {
    const res = await OZL.methods.getTotalVolumeInUSD().call();
    return fromAtomicUnit(res)
}

export async function getTotalVolumeInETH() {
    const res = await OZL.methods.getTotalVolumeInETH().call();
    return fromAtomicUnit(res)
}

export async function getAUMWeth() {
    const res = await OZL.methods.getAUM().call();
    return fromAtomicUnit(res[0])
}

export async function getAUMValue() {
    const res = await OZL.methods.getAUM().call();
    return fromAtomicUnit(res[1])
}

// functions -- APP -- as in document
export async function balanceOf(address) {
    const res = await OZL.methods.balanceOf(address).call();
    return fromAtomicUnit(res)
}

export async function getOzelBalances(address) {
    const res = await OZL.methods.getOzelBalances(address).call();
    return [fromAtomicUnit(res[0]), fromAtomicUnit(res[1])] 
}

// functions -- WIDGET -- as in document
export async function getTokenDatabase() {
    const res = await StorageBeacon.methods.getTokenDatabase().call();
    return res;
}

export async function getProxyByUser(address) {
    const res = await StorageBeacon.methods.getProxyByUser(address).call();
    return res;
}

// in progress
export async function createNewProxy(address,token, slippage) {
    const res = await OZERC1967Proxy.methods.createNewProxy([address, token, parseInt(slippage*100)]).send({ from: address });
    return res;
}

// functions -- CHANGE -- as in document
// in progress
export async function  changeUserToken(selectedAccount, token, address){
    const OZBeaconProxy = new web3_eth.eth.Contract(OZBeaconProxy_ABI, selectedAccount);
    const res = await OZBeaconProxy.methods.changeUserToken(token).send({ from : address });
    return res;
}

export async function changeUserSlippage(selectedAccount, slippage, address) {
    const OZBeaconProxy = new web3_eth.eth.Contract(OZBeaconProxy_ABI, selectedAccount);
    const res = await OZBeaconProxy.methods.changeUserSlippage(parseInt(slippage * 100)).send({ from: address });
    return res;
}

// functions -- STATS -- as in document
// in progress
export async function getProxyPayments(address) {
    const res = await StorageBeacon.methods.getProxyPayments(address).call()
    return fromAtomicUnit(res);
}

export async function getUserDetails(token) {
    const OZBeaconProxy = new web3_eth.eth.Contract(OZBeaconProxy_ABI, token);
    const res = await OZBeaconProxy.methods.getUserDetails().call()
    return res;
}

export async function getTxReceipt(txHash){
    return await web3_eth.eth.getTransactionReceipt(txHash);
}