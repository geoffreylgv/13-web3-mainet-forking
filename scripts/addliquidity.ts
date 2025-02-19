import { ethers } from "hardhat";
const utils = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const execute = async () => {
    
    const TOKEN_ONE = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC Token Contract
    const TOKEN_TWO = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI Token Contract
   
    const SWAP_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap Router Address
  
    const LIQUIDITY_PROVIDER = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621"; // Existing liquidity provider address

    await utils.impersonateAccount(LIQUIDITY_PROVIDER);
    const testAccount = await ethers.getSigner(LIQUIDITY_PROVIDER);

    let tokenOneContract = await ethers.getContractAt('OurIERC20', TOKEN_ONE);
    let tokenTwoContract = await ethers.getContractAt('OurIERC20', TOKEN_TWO);
    let swapContract = await ethers.getContractAt('IUniswapV2Router02', SWAP_ROUTER);

    const tokenOneBalance = await tokenOneContract.balanceOf(testAccount.address);
    const tokenTwoBalance = await tokenTwoContract.balanceOf(testAccount.address);

    console.log('Simulated account TOKEN_ONE balance before swap:', ethers.formatUnits(tokenOneBalance, 6));
    console.log('Simulated account TOKEN_TWO balance before swap:', ethers.formatUnits(tokenTwoBalance, 18));

    let desiredAmountOne = ethers.parseUnits('100000', 6);
    let desiredAmountTwo = ethers.parseUnits('100000', 18);

    let minAmountOne = ethers.parseUnits('99000', 6);
    let minAmountTwo = ethers.parseUnits('99000', 18);

    let txnDeadline = await utils.time.latest() + 500;

    await tokenOneContract.connect(testAccount).approve(SWAP_ROUTER, desiredAmountOne);
    await tokenTwoContract.connect(testAccount).approve(SWAP_ROUTER, desiredAmountTwo);

    console.log('-------------------------- Starting Liquidity Addition Process -------------');
    console.log('Approving token transfers and preparing to add liquidity...');

    await swapContract.connect(testAccount).addLiquidity(
        TOKEN_ONE,
        TOKEN_TWO,
        desiredAmountOne,
        desiredAmountTwo,
        minAmountOne,
        minAmountTwo,
        testAccount.address,
        txnDeadline
    );

    console.log('-------------------------- Liquidity Successfully Provided -------------');
    console.log('Tokens have been successfully added to the liquidity pool.');

    const tokenOneBalanceAfter = await tokenOneContract.balanceOf(testAccount.address);
    const tokenTwoBalanceAfter = await tokenTwoContract.balanceOf(testAccount.address);

    console.log('Simulated account TOKEN_ONE balance after swap:', ethers.formatUnits(tokenOneBalanceAfter, 6));
    console.log('Simulated account TOKEN_TWO balance after swap:', ethers.formatUnits(tokenTwoBalanceAfter, 18));
}

execute().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
