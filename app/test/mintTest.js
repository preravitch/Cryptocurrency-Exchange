const { expect } = require("chai");

describe("MockBTC and MockUSDT contracts", function () {
    let MockBTC;
    let MockUSDT;
    let mockBTC;
    let mockUSDT;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        MockBTC = await ethers.getContractFactory("MockBTC");
        MockUSDT = await ethers.getContractFactory("MockUSDT");

        mockBTC = await MockBTC.deploy();
        mockUSDT = await MockUSDT.deploy();
    });

    it("Should mint tokens to exchange", async function () {
        const amount = ethers.utils.parseEther("100");

        await mockBTC.connect(owner).mintToExchange(addr1.address, amount);
        await mockUSDT.connect(owner).mintToExchange(addr2.address, amount);

        const balanceBTC = await mockBTC.balanceOf(addr1.address);
        const balanceUSDT = await mockUSDT.balanceOf(addr2.address);

        expect(balanceBTC).to.equal(amount);
        expect(balanceUSDT).to.equal(amount);
    });

    it("Should not mint tokens to exchange if not called by owner", async function () {
        const amount = ethers.utils.parseEther("100");

        await expect(
            mockBTC.connect(addr1).mintToExchange(addr2.address, amount)
        ).to.be.revertedWith("Ownable: caller is not the owner");

        await expect(
            mockUSDT.connect(addr2).mintToExchange(addr1.address, amount)
        ).to.be.revertedWith("Ownable: caller is not the owner");
    });
});
