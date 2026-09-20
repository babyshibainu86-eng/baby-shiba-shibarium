// ============================================================
// BABY SHIBA INU - SHIBARIUM BASE
// APP VERSION 4.2
// Balanced Mining System
// Telegram + Standalone Web Support
// LocalStorage + Telegram CloudStorage
// ============================================================

"use strict";

// ============================================================
// TELEGRAM
// ============================================================

let tg = window.Telegram?.WebApp || null;

function isTelegramMiniApp() {
    return !!(
        tg &&
        typeof tg.initData === "string" &&
        tg.initData.length > 0
    );
}

function initTelegram() {
    tg = window.Telegram?.WebApp || null;

    if (!tg) return;

    try {
        if (typeof tg.ready === "function") tg.ready();
        if (typeof tg.expand === "function") tg.expand();

        if (typeof tg.setHeaderColor === "function") {
            tg.setHeaderColor("#0b0f14");
        }

        if (typeof tg.setBackgroundColor === "function") {
            tg.setBackgroundColor("#0b0f14");
        }
    } catch (error) {
        console.log("Telegram initialization:", error);
    }
}

// ============================================================
// STORAGE
// ============================================================

const STORAGE_KEY = "baby_shiba_inu_game_v42";

const REFERRAL_REWARD = 3000;

// ============================================================
// VIP
// ============================================================

const VIP_LEVELS = {
    0: {
        name: "Free Member",
        title: "Free Member",
        bonus: 0,
        energy: 0,
        dailyReward: 0,
        price: 0
    },

    1: {
        name: "VIP 1",
        title: "Starter",
        bonus: 10,
        energy: 100,
        dailyReward: 500,
        price: 10000
    },

    2: {
        name: "VIP 2",
        title: "Hunter",
        bonus: 25,
        energy: 250,
        dailyReward: 1000,
        price: 50000
    },

    3: {
        name: "VIP 3",
        title: "Warrior",
        bonus: 50,
        energy: 500,
        dailyReward: 2500,
        price: 150000
    },

    4: {
        name: "VIP 4",
        title: "Elite",
        bonus: 75,
        energy: 750,
        dailyReward: 5000,
        price: 400000
    },

    5: {
        name: "VIP 5",
        title: "Shiba Legend",
        bonus: 100,
        energy: 1000,
        dailyReward: 10000,
        price: 1000000
    }
};

// ============================================================
// DEFAULT GAME STATE
// ============================================================

const DEFAULT_STATE = {

    balance: 0,
    totalMined: 0,

    level: 1,
    xp: 0,

    tapPower: 1,

    energy: 1000,
    maxEnergy: 1000,

    mineRate: 1,

    tapLevel: 1,
    energyLevel: 1,
    boostLevel: 1,

    missionProgress: 0,
    missionClaimed: false,

    sound: true,

    vipLevel: 0,
    vipRewardClaimed: false,
    vipLastRewardDate: "",

    referralCode: "",
    referralCount: 0,
    referralEarnings: 0,

    referredBy: "",
    referrals: [],
    pendingReferral: null,
    referralProcessed: false
};

let gameState = {
    ...DEFAULT_STATE
};

let telegramUser = null;

let miningInterval = null;
let energyInterval = null;
let cloudSaveTimer = null;

let initialized = false;

// ============================================================
// BALANCE / NUMBERS
// ============================================================

function safeNumber(value, fallback = 0) {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}

function formatNumber(value) {

    value = safeNumber(value);

    if (Math.abs(value) >= 1000000000) {
        return (
            value / 1000000000
        ).toFixed(2) + "B";
    }

    if (Math.abs(value) >= 1000000) {
        return (
            value / 1000000
        ).toFixed(2) + "M";
    }

    if (Math.abs(value) >= 1000) {
        return (
            value / 1000
        ).toFixed(2) + "K";
    }

    return Math.floor(value).toLocaleString();
}

function formatMiningRate(value) {

    value = safeNumber(value);

    if (value < 10) {
        return value
            .toFixed(2)
            .replace(/\.00$/, "")
            .replace(/(\.\d)0$/, "$1");
    }

    return Math.floor(value).toLocaleString();
}

// ============================================================
// TELEGRAM USER
// ============================================================

function getTelegramUser() {

    try {

        if (!tg) {
            return null;
        }

        if (
            tg.initDataUnsafe &&
            tg.initDataUnsafe.user
        ) {
            return tg.initDataUnsafe.user;
        }

    } catch (error) {

        console.log(
            "Telegram user error:",
            error
        );
    }

    return null;
}

function refreshUser() {

    telegramUser = getTelegramUser();

    if (
        telegramUser &&
        !gameState.referralCode
    ) {
        gameState.referralCode =
            String(
                telegramUser.id || ""
            );
    }
}

function getUserDisplayName() {

    if (!telegramUser) {
        return "Player";
    }

    const firstName =
        telegramUser.first_name || "";

    const lastName =
        telegramUser.last_name || "";

    const fullName =
        (
            firstName +
            " " +
            lastName
        ).trim();

    if (fullName) {
        return fullName;
    }

    if (telegramUser.username) {
        return "@" + telegramUser.username;
    }

    return "Player";
}

// ============================================================
// LOCAL STORAGE
// ============================================================

function saveLocalGame() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(gameState)
        );

    } catch (error) {

        console.log(
            "Local save error:",
            error
        );
    }
}

function loadLocalGame() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!saved) {
            return false;
        }

        const parsed =
            JSON.parse(saved);

        if (
            !parsed ||
            typeof parsed !== "object"
        ) {
            return false;
        }

        gameState = {
            ...DEFAULT_STATE,
            ...parsed
        };

        return true;

    } catch (error) {

        console.log(
            "Local load error:",
            error
        );

        return false;
    }
}

// ============================================================
// TELEGRAM CLOUD STORAGE
// ============================================================

function saveGameToTelegram() {

    if (!isTelegramMiniApp()) {

        saveLocalGame();

        return;
    }

    if (!tg || !tg.CloudStorage) {

        saveLocalGame();

        return;
    }

    try {

        tg.CloudStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(gameState),
            function(error) {

                if (error) {

                    console.log(
                        "CloudStorage save error:",
                        error
                    );

                    saveLocalGame();
                }
            }
        );

    } catch (error) {

        console.log(
            "CloudStorage save exception:",
            error
        );

        saveLocalGame();
    }
}

function scheduleCloudSave() {

    saveLocalGame();

    clearTimeout(
        cloudSaveTimer
    );

    cloudSaveTimer =
        setTimeout(
            () => {
                saveGameToTelegram();
            },
            800
        );
}

function loadGameFromTelegram() {

    return new Promise(
        (resolve) => {

            if (!isTelegramMiniApp()) {

                loadLocalGame();

                resolve(false);

                return;
            }

            if (!tg || !tg.CloudStorage) {

                loadLocalGame();

                resolve(false);

                return;
            }

            let finished = false;

            const finish = (loaded) => {

                if (finished) {
                    return;
                }

                finished = true;

                resolve(loaded);
            };

            const timeout =
                setTimeout(
                    () => {

                        loadLocalGame();

                        finish(false);

                    },
                    1500
                );

            try {

                tg.CloudStorage.getItem(
                    STORAGE_KEY,
                    function(error, value) {

                        clearTimeout(
                            timeout
                        );

                        if (
                            error ||
                            !value
                        ) {

                            loadLocalGame();

                            finish(false);

                            return;
                        }

                        try {

                            const parsed =
                                JSON.parse(value);

                            if (
                                parsed &&
                                typeof parsed === "object"
                            ) {

                                gameState = {
                                    ...DEFAULT_STATE,
                                    ...parsed
                                };

                                saveLocalGame();

                                finish(true);

                                return;
                            }

                        } catch (parseError) {

                            console.log(
                                "Cloud parse error:",
                                parseError
                            );
                        }

                        loadLocalGame();

                        finish(false);
                    }
                );

            } catch (error) {

                clearTimeout(timeout);

                loadLocalGame();

                finish(false);
            }
        }
    );
}

// ============================================================
// PLAYER INFO
// ============================================================

function updatePlayerInfo() {

    const name =
        getUserDisplayName();

    document
        .querySelectorAll(
            "#playerName, .player-name"
        )
        .forEach(
            (element) => {
                element.textContent = name;
            }
        );

    document
        .querySelectorAll(
            "#playerId, .player-id"
        )
        .forEach(
            (element) => {

                if (
                    telegramUser &&
                    telegramUser.id
                ) {

                    element.textContent =
                        "ID: " +
                        telegramUser.id;

                } else {

                    element.textContent =
                        "ID: Guest";
                }
            }
        );
}

// ============================================================
// VIP BONUS
// ============================================================

function getVipBonus() {

    const vip =
        VIP_LEVELS[
            gameState.vipLevel
        ];

    if (!vip) {
        return 0;
    }

    return safeNumber(vip.bonus);
}

// ============================================================
// MINING RATE
// ============================================================

function getEffectiveMineRate() {

    const baseRate =
        Math.max(
            1,
            safeNumber(
                gameState.mineRate,
                1
            )
        );

    const vipBonus =
        getVipBonus();

    return (
        baseRate *
        (
            1 +
            vipBonus / 100
        )
    );
}

// ============================================================
// TAP POWER
// ============================================================

function getEffectiveTapPower() {

    const basePower =
        Math.max(
            1,
            safeNumber(
                gameState.tapPower,
                1
            )
        );

    const vipBonus =
        getVipBonus();

    return (
        basePower *
        (
            1 +
            vipBonus / 100
        )
    );
}

// ============================================================
// XP SYSTEM — SLOWER
// ============================================================

function getXpRequired(level) {

    level =
        Math.max(
            1,
            Math.floor(
                safeNumber(
                    level,
                    1
                )
            )
        );

    /*
     * Slower progression.
     *
     * Level 1 = 500 XP
     * Level 2 = 1000 XP
     * Level 3 = 1500 XP
     */

    return 500 * level;
}

function addXP(amount) {

    amount =
        safeNumber(amount);

    if (amount <= 0) {
        return;
    }

    gameState.xp += amount;

    let required =
        getXpRequired(
            gameState.level
        );

    while (
        gameState.xp >= required &&
        gameState.level < 100
    ) {

        gameState.xp -= required;

        gameState.level++;

        showToast(
            "🎉 Level Up! Level " +
            gameState.level
        );

        required =
            getXpRequired(
                gameState.level
            );
    }
}

// ============================================================
// TEXT
// ============================================================

function setText(
    selector,
    value
) {

    document
        .querySelectorAll(selector)
        .forEach(
            (element) => {
                element.textContent = value;
            }
        );
}

// ============================================================
// UPDATE UI
// ============================================================

function updateUI() {

    gameState.balance =
        Math.max(
            0,
            safeNumber(
                gameState.balance
            )
        );

    gameState.totalMined =
        Math.max(
            0,
            safeNumber(
                gameState.totalMined
            )
        );

    gameState.energy =
        Math.max(
            0,
            safeNumber(
                gameState.energy
            )
        );

    gameState.maxEnergy =
        Math.max(
            1,
            safeNumber(
                gameState.maxEnergy,
                1000
            )
        );

    gameState.level =
        Math.max(
            1,
            Math.floor(
                safeNumber(
                    gameState.level,
                    1
                )
            )
        );

    gameState.xp =
        Math.max(
            0,
            safeNumber(
                gameState.xp
            )
        );

    gameState.tapPower =
        Math.max(
            1,
            safeNumber(
                gameState.tapPower,
                1
            )
        );

    gameState.mineRate =
        Math.max(
            1,
            safeNumber(
                gameState.mineRate,
                1
            )
        );

    const tapPower =
        getEffectiveTapPower();

    const mineRate =
        getEffectiveMineRate();

    setText(
        "#balance",
        formatNumber(
            gameState.balance
        )
    );

    setText(
        "#totalMined",
        formatNumber(
            gameState.totalMined
        )
    );

    setText(
        "#level",
        gameState.level
    );

    setText(
        "#tapPower",
        formatMiningRate(
            tapPower
        )
    );

    setText(
        "#mineRate",
        formatMiningRate(
            mineRate
        ) +
        " BSHIB/s"
    );

    setText(
        "#statsMineRate",
        formatMiningRate(
            mineRate
        )
    );

    setText(
        "#energy",
        Math.floor(
            gameState.energy
        )
    );

    setText(
        "#maxEnergy",
        Math.floor(
            gameState.maxEnergy
        )
    );

    const energyFill =
        document.getElementById(
            "energyFill"
        );

    if (energyFill) {

        const percentage =
            (
                gameState.energy /
                gameState.maxEnergy
            ) * 100;

        energyFill.style.width =
            Math.max(
                0,
                Math.min(
                    100,
                    percentage
                )
            ) + "%";
    }

    const requiredXP =
        getXpRequired(
            gameState.level
        );

    const xpFill =
        document.getElementById(
            "xpFill"
        );

    if (xpFill) {

        const percentage =
            (
                gameState.xp /
                requiredXP
            ) * 100;

        xpFill.style.width =
            Math.max(
                0,
                Math.min(
                    100,
                    percentage
                )
            ) + "%";
    }

    let levelName =
        "Shiba Rookie";

    if (gameState.level >= 50) {

        levelName =
            "Shiba Legend";

    } else if (gameState.level >= 25) {

        levelName =
            "Shiba Master";

    } else if (gameState.level >= 15) {

        levelName =
            "Shiba Warrior";

    } else if (gameState.level >= 10) {

        levelName =
            "Shiba Hunter";

    } else if (gameState.level >= 5) {

        levelName =
            "Shiba Pup";
    }

    setText(
        "#levelName",
        levelName
    );

    const miningStatus =
        document.getElementById(
            "miningStatus"
        );

    if (miningStatus) {

        if (gameState.energy > 0) {

            miningStatus.textContent =
                "Mining";

        } else {

            miningStatus.textContent =
                "Energy Empty";
        }
    }

    updateUpgradeUI();
    updateShopUI();
    updateVipUI();
    updateReferralUI();
    updateSoundButton();
}

// ============================================================
// TAP MINING
// ============================================================

function mine() {

    if (gameState.energy <= 0) {

        showToast(
            "⚡ Energy is empty"
        );

        return;
    }

    const amount =
        getEffectiveTapPower();

    /*
     * One tap consumes one energy.
     */

    gameState.energy =
        Math.max(
            0,
            gameState.energy - 1
        );

    gameState.balance += amount;

    gameState.totalMined += amount;

    gameState.missionProgress =
        safeNumber(
            gameState.missionProgress
        ) + 1;

    /*
     * Much slower XP progression.
     *
     * 4 taps = 1 XP
     */

    addXP(0.25);

    createCoinEffect(amount);

    updateUI();

    scheduleCloudSave();
}

// ============================================================
// AUTO MINING
// ============================================================

function automaticMiningTick() {

    /*
     * Auto mining gives the displayed
     * mining rate once per second.
     *
     * IMPORTANT:
     * Auto mining NO LONGER consumes Energy.
     *
     * Energy is now the resource used
     * by manual tapping.
     */

    const amount =
        getEffectiveMineRate();

    gameState.balance += amount;

    gameState.totalMined += amount;

    updateUI();

    scheduleCloudSave();
}

// ============================================================
// START AUTO MINING
// ============================================================

function startMiningLoop() {

    if (miningInterval) {

        clearInterval(
            miningInterval
        );
    }

    miningInterval =
        setInterval(
            automaticMiningTick,
            1000
        );
}

// ============================================================
// ENERGY REGENERATION
// ============================================================

function startEnergyLoop() {

    if (energyInterval) {

        clearInterval(
            energyInterval
        );
    }

    /*
     * Energy regeneration:
     *
     * +2 Energy / second
     *
     * Auto mining does not consume energy.
     * Therefore Energy can refill naturally.
     */

    energyInterval =
        setInterval(
            () => {

                if (
                    gameState.energy <
                    gameState.maxEnergy
                ) {

                    gameState.energy =
                        Math.min(
                            gameState.maxEnergy,
                            gameState.energy + 2
                        );

                    updateUI();
                }

            },
            1000
        );
}

// ============================================================
// START GAME
// ============================================================

function startGame() {

    const intro =
        document.getElementById(
            "introPage"
        );

    const gameApp =
        document.getElementById(
            "gameApp"
        );

    if (intro) {

        intro.classList.remove(
            "active"
        );

        intro.classList.add(
            "hidden"
        );

        intro.style.display =
            "none";
    }

    if (gameApp) {

        gameApp.classList.remove(
            "hidden"
        );

        gameApp.style.display =
            "block";
    }

    showPage("miningPage");

    updatePlayerInfo();

    updateUI();

    startMiningLoop();

    startEnergyLoop();

    scheduleCloudSave();

    showToast(
        "🐕 Welcome to Baby Shiba Inu!"
    );
}

// ============================================================
// PAGE NAVIGATION
// ============================================================

function showPage(pageId) {

    const pages =
        document.querySelectorAll(
            ".game-page"
        );

    pages.forEach(
        (page) => {
            page.classList.remove(
                "active"
            );
        }
    );

    const target =
        document.getElementById(
            pageId
        );

    if (target) {
        target.classList.add(
            "active"
        );
    }

    updateNavigation(pageId);
}

function updateNavigation(pageId) {

    const navItems =
        document.querySelectorAll(
            ".bottom-nav .nav-item"
        );

    navItems.forEach(
        (item) => {
            item.classList.remove(
                "active"
            );
        }
    );

    const mapping = {
        miningPage: 0,
        itemsPage: 1,
        shopPage: 2,
        vipPage: 3,
        friendsPage: 4,
        arenaPage: 5
    };

    const index =
        mapping[pageId];

    if (
        index !== undefined &&
        navItems[index]
    ) {

        navItems[index].classList.add(
            "active"
        );
    }
}

// ============================================================
// COIN FLOAT EFFECT
// ============================================================

function createCoinEffect(amount) {

    const effects =
        document.getElementById(
            "effects"
        );

    if (!effects) {
        return;
    }

    const coin =
        document.createElement(
            "div"
        );

    coin.className =
        "coin-float";

    coin.textContent =
        "+" +
        formatMiningRate(amount);

    coin.style.left =
        (
            42 +
            Math.random() * 16
        ) + "%";

    coin.style.top =
        "45%";

    effects.appendChild(coin);

    setTimeout(
        () => {

            if (coin.parentNode) {
                coin.remove();
            }

        },
        900
    );
}

// ============================================================
// UPGRADE COSTS
// ============================================================

function getTapUpgradeCost() {

    return Math.floor(
        100 *
        Math.pow(
            1.6,
            Math.max(
                0,
                gameState.tapLevel - 1
            )
        )
    );
}

function getEnergyUpgradeCost() {

    return Math.floor(
        250 *
        Math.pow(
            1.7,
            Math.max(
                0,
                gameState.energyLevel - 1
            )
        )
    );
}

function getBoostUpgradeCost() {

    return Math.floor(
        500 *
        Math.pow(
            1.8,
            Math.max(
                0,
                gameState.boostLevel - 1
            )
        )
    );
}

// ============================================================
// TAP UPGRADE
// ============================================================

function upgradeTap() {

    const cost =
        getTapUpgradeCost();

    if (gameState.balance < cost) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;
    }

    gameState.balance -= cost;

    gameState.tapLevel++;

    gameState.tapPower++;

    updateUI();

    scheduleCloudSave();

    showToast(
        "⚡ Tap Power upgraded!"
    );
}

// ============================================================
// ENERGY UPGRADE
// ============================================================

function upgradeEnergy() {

    const cost =
        getEnergyUpgradeCost();

    if (gameState.balance < cost) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;
    }

    gameState.balance -= cost;

    gameState.energyLevel++;

    gameState.maxEnergy += 250;

    gameState.energy =
        Math.min(
            gameState.maxEnergy,
            gameState.energy + 250
        );

    updateUI();

    scheduleCloudSave();

    showToast(
        "🔋 Energy upgraded!"
    );
}

// ============================================================
// MINING BOOST
// ============================================================

function upgradeBoost() {

    const cost =
        getBoostUpgradeCost();

    if (gameState.balance < cost) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;
    }

    gameState.balance -= cost;

    gameState.boostLevel++;

    gameState.mineRate++;

    updateUI();

    scheduleCloudSave();

    showToast(
        "🚀 Mining Rate upgraded!"
    );
}

// ============================================================
// UPGRADE UI
// ============================================================

function updateUpgradeUI() {

    setText(
        "#tapCost",
        formatNumber(
            getTapUpgradeCost()
        )
    );

    setText(
        "#energyCost",
        formatNumber(
            getEnergyUpgradeCost()
        )
    );

    setText(
        "#boostCost",
        formatNumber(
            getBoostUpgradeCost()
        )
    );
}

// ============================================================
// SHOP
// ============================================================

function buyEnergyPack() {

    const cost = 250;

    if (gameState.balance < cost) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;
    }

    gameState.balance -= cost;

    gameState.energy =
        Math.min(
            gameState.maxEnergy,
            gameState.energy + 500
        );

    updateUI();

    scheduleCloudSave();

    showToast(
        "⚡ +500 Energy"
    );
}

function buyMiningBoost() {

    const cost = 500;

    if (gameState.balance < cost) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;
    }

    gameState.balance -= cost;

    gameState.mineRate++;

    updateUI();

    scheduleCloudSave();

    showToast(
        "🚀 Mining Rate Increased!"
    );
}

function updateShopUI() {

    setText(
        "#energyPackCost",
        "250"
    );

    setText(
        "#miningBoostCost",
        "500"
    );
}

// ============================================================
// VIP UI
// ============================================================

function updateVipUI() {

    const level =
        Math.max(
            0,
            Math.min(
                5,
                Math.floor(
                    safeNumber(
                        gameState.vipLevel,
                        0
                    )
                )
            )
        );

    gameState.vipLevel = level;

    const vip =
        VIP_LEVELS[level];

    if (!vip) {
        return;
    }

    setText(
        "#vipCurrentName",
        vip.name
    );

    setText(
        "#vipLevel",
        "VIP " + level
    );

    setText(
        "#vipMiningBonus",
        "+" + vip.bonus + "%"
    );

    setText(
        "#vipEnergyBonus",
        "+" + vip.energy
    );

    if (vip.dailyReward > 0) {

        setText(
            "#vipDailyReward",
            formatNumber(
                vip.dailyReward
            ) +
            " BSHIB"
        );

    } else {

        setText(
            "#vipDailyReward",
            "Locked"
        );
    }

    updateVipCards();
}

// ============================================================
// VIP CARDS
// ============================================================

function updateVipCards() {

    const cards =
        document.querySelectorAll(
            "[data-vip-level]"
        );

    cards.forEach(
        (card) => {

            const level =
                Number(
                    card.dataset.vipLevel
                );

            const button =
                card.classList.contains(
                    "vip-buy-btn"
                )
                    ? card
                    : card.querySelector(
                        ".vip-buy-btn"
                    );

            if (!button) {
                return;
            }

            if (
                level ===
                gameState.vipLevel
            ) {

                button.disabled = true;

                button.textContent =
                    "✅ Current";

            } else if (
                level <
                gameState.vipLevel
            ) {

                button.disabled = true;

                button.textContent =
                    "✓ Unlocked";

            } else {

                button.disabled = false;

                button.textContent =
                    "👑 Activate VIP " +
                    level;
            }
        }
    );
}

// ============================================================
// BUY VIP
// ============================================================

function buyVIP(level) {

    level = Number(level);

    if (!VIP_LEVELS[level]) {
        return;
    }

    if (
        level <=
        gameState.vipLevel
    ) {

        showToast(
            "👑 VIP already unlocked"
        );

        return;
    }

    if (
        level !==
        gameState.vipLevel + 1
    ) {

        showToast(
            "🔒 Unlock the previous VIP first"
        );

        return;
    }

    const vip =
        VIP_LEVELS[level];

    if (
        gameState.balance <
        vip.price
    ) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;
    }

    gameState.balance -=
        vip.price;

    gameState.vipLevel =
        level;

    gameState.maxEnergy +=
        vip.energy;

    gameState.energy =
        Math.min(
            gameState.maxEnergy,
            gameState.energy + vip.energy
        );

    updateUI();

    scheduleCloudSave();

    showToast(
        "👑 VIP " +
        level +
        " Activated!"
    );
}

// ============================================================
// VIP DAILY REWARD
// ============================================================

function claimVipReward() {

    const vip =
        VIP_LEVELS[
            gameState.vipLevel
        ];

    if (
        !vip ||
        vip.dailyReward <= 0
    ) {

        showToast(
            "🔒 VIP reward is locked"
        );

        return;
    }

    const today =
        new Date()
            .toISOString()
            .slice(0, 10);

    if (
        gameState.vipLastRewardDate ===
        today
    ) {

        showToast(
            "🎁 Already claimed today"
        );

        return;
    }

    gameState.balance +=
        vip.dailyReward;

    gameState.vipLastRewardDate =
        today;

    gameState.vipRewardClaimed =
        true;

    updateUI();

    scheduleCloudSave();

    showToast(
        "🎁 +" +
        formatNumber(
            vip.dailyReward
        ) +
        " BSHIB"
    );
}

// ============================================================
// REFERRAL
// ============================================================

function setupReferral() {

    if (!gameState.referralCode) {

        if (
            telegramUser &&
            telegramUser.id
        ) {

            gameState.referralCode =
                String(
                    telegramUser.id
                );

        } else {

            gameState.referralCode =
                "BSHIB-" +
                Math.random()
                    .toString(36)
                    .substring(
                        2,
                        8
                    )
                    .toUpperCase();
        }
    }

    processStartParameter();

    updateReferralUI();
}

function processStartParameter() {

    if (
        gameState.referralProcessed
    ) {
        return;
    }

    try {

        const startParam =
            tg?.initDataUnsafe
                ?.start_param;

        if (!startParam) {

            gameState.referralProcessed =
                true;

            return;
        }

        if (
            startParam ===
            gameState.referralCode
        ) {

            gameState.referralProcessed =
                true;

            return;
        }

        gameState.referredBy =
            String(
                startParam
            );

        gameState.referralProcessed =
            true;

        scheduleCloudSave();

    } catch (error) {

        console.log(
            "Referral error:",
            error
        );
    }
}

function updateReferralUI() {

    setText(
        "#refCode",
        gameState.referralCode ||
        "BSHIB"
    );
}

function getReferralLink() {

    const code =
        gameState.referralCode ||
        "BSHIB";

    return (
        "https://t.me/shibababycoinbot" +
        "?startapp=" +
        encodeURIComponent(code)
    );
}

async function copyReferral() {

    const link =
        getReferralLink();

    try {

        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            await navigator.clipboard.writeText(
                link
            );

        } else {

            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.value = link;

            document.body.appendChild(
                textarea
            );

            textarea.select();

            document.execCommand(
                "copy"
            );

            textarea.remove();
        }

        showToast(
            "📋 Referral link copied!"
        );

    } catch (error) {

        showToast(
            "🔗 " + link
        );
    }
}

function inviteFriends() {

    const link =
        getReferralLink();

    const text =
        "🐕 Join Baby Shiba Inu and start mining BSHIB!";

    const shareUrl =
        "https://t.me/share/url?url=" +
        encodeURIComponent(link) +
        "&text=" +
        encodeURIComponent(text);

    if (
        tg &&
        typeof tg.openTelegramLink ===
        "function"
    ) {

        tg.openTelegramLink(
            shareUrl
        );

        return;
    }

    window.open(
        shareUrl,
        "_blank"
    );
}

// ============================================================
// SOUND
// ============================================================

function updateSoundButton() {

    const button =
        document.getElementById(
            "soundBtn"
        );

    if (!button) {
        return;
    }

    button.textContent =
        gameState.sound
            ? "🔊"
            : "🔇";
}

function toggleSound() {

    gameState.sound =
        !gameState.sound;

    updateSoundButton();

    scheduleCloudSave();

    showToast(
        gameState.sound
            ? "🔊 Sound On"
            : "🔇 Sound Off"
    );
}

// ============================================================
// TOAST
// ============================================================

let toastTimer = null;

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    const toastText =
        document.getElementById(
            "toastText"
        );

    if (
        !toast ||
        !toastText
    ) {
        return;
    }

    toastText.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );
}

// ============================================================
// BUTTON SETUP
// ============================================================

function setupButtons() {

    const startButton =
        document.getElementById(
            "startGame"
        );

    if (startButton) {

        startButton.onclick =
            function(event) {

                if (event) {
                    event.preventDefault();
                }

                startGame();
            };
    }

    const shibaButton =
        document.getElementById(
            "shibaButton"
        );

    if (shibaButton) {

        shibaButton.onclick =
            function(event) {

                if (event) {
                    event.preventDefault();
                }

                mine();
            };
    }

    const soundButton =
        document.getElementById(
            "soundBtn"
        );

    if (soundButton) {

        soundButton.onclick =
            function(event) {

                if (event) {
                    event.preventDefault();
                }

                toggleSound();
            };
    }

    const energyPack =
        document.getElementById(
            "buyEnergyPack"
        );

    if (energyPack) {

        energyPack.onclick =
            function(event) {

                if (event) {
                    event.preventDefault();
                }

                buyEnergyPack();
            };
    }

    const miningBoost =
        document.getElementById(
            "buyMiningBoost"
        );

    if (miningBoost) {

        miningBoost.onclick =
            function(event) {

                if (event) {
                    event.preventDefault();
                }

                buyMiningBoost();
            };
    }

    const copyRef =
        document.getElementById(
            "copyRef"
        );

    if (copyRef) {

        copyRef.onclick =
            function(event) {

                if (event) {
                    event.preventDefault();
                }

                copyReferral();
            };
    }

    const inviteButton =
        document.getElementById(
            "inviteBtn"
        );

    if (inviteButton) {

        inviteButton.onclick =
            function(event) {

                if (event) {
                    event.preventDefault();
                }

                inviteFriends();
            };
    }

    const vipReward =
        document.getElementById(
            "claimVipReward"
        );

    if (vipReward) {

        vipReward.onclick =
            function(event) {

                if (event) {
                    event.preventDefault();
                }

                claimVipReward();
            };
    }

    document
        .querySelectorAll(
            ".vip-buy-btn"
        )
        .forEach(
            (button) => {

                const level =
                    button.dataset.vipLevel;

                if (!level) {
                    return;
                }

                button.onclick =
                    function(event) {

                        if (event) {
                            event.preventDefault();
                        }

                        buyVIP(level);
                    };
            }
        );
}

// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".bottom-nav .nav-item"
        );

    const pageIds = [
        "miningPage",
        "itemsPage",
        "shopPage",
        "vipPage",
        "friendsPage",
        "arenaPage"
    ];

    navItems.forEach(
        (item, index) => {

            if (!pageIds[index]) {
                return;
            }

            item.addEventListener(
                "click",
                function() {

                    showPage(
                        pageIds[index]
                    );
                }
            );
        }
    );
}

// ============================================================
// INITIALIZATION
// ============================================================

async function initApp() {

    if (initialized) {
        return;
    }

    initialized = true;

    try {

        initTelegram();

        loadLocalGame();

        refreshUser();

        updatePlayerInfo();

        updateUI();

        setupButtons();

        setupNavigation();

        setupReferral();

        updateSoundButton();

        await loadGameFromTelegram();

        refreshUser();

        updatePlayerInfo();

        updateUI();

        setupReferral();

        updateSoundButton();

        const intro =
            document.getElementById(
                "introPage"
            );

        const gameApp =
            document.getElementById(
                "gameApp"
            );

        if (intro) {

            intro.classList.add(
                "active"
            );

            intro.classList.remove(
                "hidden"
            );

            intro.style.display =
                "flex";
        }

        if (gameApp) {

            gameApp.classList.add(
                "hidden"
            );

            gameApp.style.display =
                "none";
        }

    } catch (error) {

        console.error(
            "Baby Shiba initialization error:",
            error
        );

        setupButtons();
    }
}

// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.startGame = startGame;
window.showPage = showPage;
window.mine = mine;

window.upgradeTap = upgradeTap;
window.upgradeEnergy = upgradeEnergy;
window.upgradeBoost = upgradeBoost;

window.buyEnergyPack = buyEnergyPack;
window.buyMiningBoost = buyMiningBoost;

window.buyVIP = buyVIP;
window.claimVipReward = claimVipReward;

window.copyRef = copyReferral;
window.inviteFriends = inviteFriends;

window.toggleSound = toggleSound;

// ============================================================
// RUN
// ============================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initApp
    );

} else {

    initApp();
      }
