import { ethers } from "hardhat";
import { impersonateAccount } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const TOKEN_ONE = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC Token Contract
const TOKEN_TWO = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI Token Contract
const NONFUNGIBLE_POSITION_MANAGER = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"; // Uniswap V3 Position Manager Address
const LIQUIDITY_PROVIDER = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621"; // Existing liquidity provider address


const execute = async () => {

    await impersonateAccount(LIQUIDITY_PROVIDER);
    const testAccount = await ethers.getSigner(LIQUIDITY_PROVIDER);

    const tokenOneContract = await ethers.getContractAt("IERC20", TOKEN_ONE);
    const tokenTwoContract = await ethers.getContractAt("IERC20", TOKEN_TWO);

    const positionManagerContract = await ethers.getContractAt(
        "INonfungiblePositionManager",
        NONFUNGIBLE_POSITION_MANAGER
    );

    const tokenOneBalance = await tokenOneContract.balanceOf(testAccount.address);
    const tokenTwoBalance = await tokenTwoContract.balanceOf(testAccount.address);

    console.log(
        "Simulated account TOKEN_ONE balance before adding liquidity:",
        ethers.formatUnits(tokenOneBalance, 6)
    );
    console.log(
        "Simulated account TOKEN_TWO balance before adding liquidity:",
        ethers.formatUnits(tokenTwoBalance, 18)
    );

    const desiredAmountOne = ethers.parseUnits("100000", 6);
    const desiredAmountTwo = ethers.parseUnits("100000", 18);

    const minAmountOne = ethers.parseUnits("99000", 6);
    const minAmountTwo = ethers.parseUnits("99000", 18);

    const feeTier = 3000;
    const tickLower = -887220;
    const tickUpper = 887220;

    const txnDeadline = Math.floor(Date.now() / 1000) + 500;

    console.log("Approving token transfers...");
    await tokenOneContract.connect(testAccount).approve(NONFUNGIBLE_POSITION_MANAGER, desiredAmountOne);
    await tokenTwoContract.connect(testAccount).approve(NONFUNGIBLE_POSITION_MANAGER, desiredAmountTwo);

    console.log("-------------------------- Starting Liquidity Addition Process -------------");

    const mintParams: INonfungiblePositionManager.MintParamsStruct = {
        token0: TOKEN_ONE,
        token1: TOKEN_TWO,
        fee: feeTier,
        tickLower: tickLower,
        tickUpper: tickUpper,
        amount0Desired: desiredAmountOne,
        amount1Desired: desiredAmountTwo,
        amount0Min: minAmountOne,
        amount1Min: minAmountTwo,
        recipient: testAccount.address,
        deadline: txnDeadline,
    };

    console.log("Adding liquidity to the pool...");
    const tx = await positionManagerContract.connect(testAccount).mint(mintParams);
    const receipt = await tx.wait();

    console.log("-------------------------- Liquidity Successfully Added -------------");
    console.log("Transaction receipt:", receipt);

    const tokenOneBalanceAfter = await tokenOneContract.balanceOf(testAccount.address);
    const tokenTwoBalanceAfter = await tokenTwoContract.balanceOf(testAccount.address);

    console.log(
        "Simulated account TOKEN_ONE balance after adding liquidity:",
        ethers.formatUnits(tokenOneBalanceAfter, 6)
    );
    console.log(
        "Simulated account TOKEN_TWO balance after adding liquidity:",
        ethers.formatUnits(tokenTwoBalanceAfter, 18)
    );
};

execute().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
