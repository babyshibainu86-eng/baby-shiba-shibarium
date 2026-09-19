// ============================================================
// BABY SHIBA INU - SHIBARIUM BASE
// APP VERSION 3.1
// Telegram + Standalone Web Support
// LocalStorage Fallback
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
        tg.ready();

        if (typeof tg.expand === "function") {
            tg.expand();
        }

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
// CONSTANTS
// ============================================================

const STORAGE_KEY = "baby_shiba_inu_game_v3";
const REFERRAL_REWARD = 3000;

const VIP_LEVELS = {
    0: {
        name: "Free Member",
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

let gameState = { ...DEFAULT_STATE };

let telegramUser = null;

let miningInterval = null;
let energyInterval = null;

let cloudSaveTimer = null;

let initialized = false;

// ============================================================
// SAFE NUMBER
// ============================================================

function safeNumber(value, fallback = 0) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return fallback;
    }

    return number;
}

// ============================================================
// FORMAT NUMBERS
// ============================================================

function formatNumber(value) {
    value = safeNumber(value);

    if (Math.abs(value) >= 1000000000) {
        return (value / 1000000000).toFixed(2) + "B";
    }

    if (Math.abs(value) >= 1000000) {
        return (value / 1000000).toFixed(2) + "M";
    }

    if (Math.abs(value) >= 1000) {
        return (value / 1000).toFixed(2) + "K";
    }

    return Math.floor(value).toLocaleString();
}

function formatMiningRate(value) {
    value = safeNumber(value);

    if (value < 10) {
        return value.toFixed(2).replace(/\.00$/, "");
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

        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            return tg.initDataUnsafe.user;
        }
    } catch (error) {
        console.log("Telegram user error:", error);
    }

    return null;
}

function refreshUser() {
    telegramUser = getTelegramUser();

    if (!telegramUser) {
        return;
    }

    if (!gameState.referralCode) {
        gameState.referralCode = String(telegramUser.id || "");
    }
}

function getUserDisplayName() {
    if (!telegramUser) {
        return "Player";
    }

    const firstName = telegramUser.first_name || "";
    const lastName = telegramUser.last_name || "";

    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
        return fullName;
    }

    if (telegramUser.username) {
        return "@" + telegramUser.username;
    }

    return "Player";
}

// ============================================================
// STORAGE
// ============================================================

function saveLocalGame() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(gameState)
        );
    } catch (error) {
        console.log("Local save error:", error);
    }
}

function loadLocalGame() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return false;
        }

        const parsed = JSON.parse(saved);

        if (!parsed || typeof parsed !== "object") {
            return false;
        }

        gameState = {
            ...DEFAULT_STATE,
            ...parsed
        };

        return true;
    } catch (error) {
        console.log("Local load error:", error);
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

    if (!tg.CloudStorage) {
        saveLocalGame();
        return;
    }

    try {
        const data = JSON.stringify(gameState);

        tg.CloudStorage.setItem(
            STORAGE_KEY,
            data,
            function (error) {
                if (error) {
                    console.log(
                        "Telegram CloudStorage save error:",
                        error
                    );

                    saveLocalGame();
                }
            }
        );
    } catch (error) {
        console.log("CloudStorage save exception:", error);

        saveLocalGame();
    }
}

function scheduleCloudSave() {
    saveLocalGame();

    clearTimeout(cloudSaveTimer);

    cloudSaveTimer = setTimeout(() => {
        saveGameToTelegram();
    }, 500);
}

function loadGameFromTelegram() {
    return new Promise((resolve) => {
        if (!isTelegramMiniApp()) {
            loadLocalGame();
            resolve(false);
            return;
        }

        if (!tg.CloudStorage) {
            loadLocalGame();
            resolve(false);
            return;
        }

        let finished = false;

        const finish = (loaded) => {
            if (finished) return;

            finished = true;
            resolve(loaded);
        };

        const timeout = setTimeout(() => {
            loadLocalGame();
            finish(false);
        }, 1500);

        try {
            tg.CloudStorage.getItem(
                STORAGE_KEY,
                function (error, value) {
                    clearTimeout(timeout);

                    if (error || !value) {
                        loadLocalGame();
                        finish(false);
                        return;
                    }

                    try {
                        const parsed = JSON.parse(value);

                        if (parsed && typeof parsed === "object") {
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
                            "CloudStorage parse error:",
                            parseError
                        );
                    }

                    loadLocalGame();
                    finish(false);
                }
            );
        } catch (error) {
            clearTimeout(timeout);

            console.log(
                "CloudStorage load exception:",
                error
            );

            loadLocalGame();
            finish(false);
        }
    });
}

// ============================================================
// PLAYER INFO
// ============================================================

function updatePlayerInfo() {
    const nameElements = document.querySelectorAll(
        "#playerName, .player-name"
    );

    const displayName = getUserDisplayName();

    nameElements.forEach((element) => {
        element.textContent = displayName;
    });

    const idElements = document.querySelectorAll(
        "#playerId, .player-id"
    );

    idElements.forEach((element) => {
        if (telegramUser?.id) {
            element.textContent =
                "ID: " + telegramUser.id;
        } else {
            element.textContent = "ID: Guest";
        }
    });
}

// ============================================================
// GAME CALCULATIONS
// ============================================================

function getVipBonus() {
    const vip = VIP_LEVELS[gameState.vipLevel];

    if (!vip) {
        return 0;
    }

    return safeNumber(vip.bonus);
}

function getEffectiveMineRate() {
    const baseRate = safeNumber(gameState.mineRate, 1);

    const vipBonus = getVipBonus();

    return baseRate * (1 + vipBonus / 100);
}

function getEffectiveTapPower() {
    const basePower = safeNumber(gameState.tapPower, 1);

    const vipBonus = getVipBonus();

    return basePower * (1 + vipBonus / 100);
}

// ============================================================
// XP / LEVEL
// ============================================================

function getXpRequired(level) {
    level = Math.max(1, Math.floor(safeNumber(level, 1)));

    return 100 * level;
}

function addXP(amount) {
    amount = safeNumber(amount);

    if (amount <= 0) {
        return;
    }

    gameState.xp += amount;

    let required = getXpRequired(gameState.level);

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

        required = getXpRequired(gameState.level);
    }
}

// ============================================================
// UI UPDATE
// ============================================================

function setText(selector, value) {
    const element = document.querySelector(selector);

    if (element) {
        element.textContent = value;
    }
}

function updateUI() {
    gameState.balance = Math.max(
        0,
        safeNumber(gameState.balance)
    );

    gameState.totalMined = Math.max(
        0,
        safeNumber(gameState.totalMined)
    );

    gameState.energy = Math.max(
        0,
        safeNumber(gameState.energy)
    );

    gameState.maxEnergy = Math.max(
        1,
        safeNumber(gameState.maxEnergy, 1000)
    );

    gameState.level = Math.max(
        1,
        Math.floor(safeNumber(gameState.level, 1))
    );

    gameState.tapPower = Math.max(
        1,
        safeNumber(gameState.tapPower, 1)
    );

    gameState.mineRate = Math.max(
        0,
        safeNumber(gameState.mineRate, 1)
    );

    const effectiveRate = getEffectiveMineRate();
    const effectiveTap = getEffectiveTapPower();

    // Balance
    setText("#balance", formatNumber(gameState.balance));
    setText("#balanceValue", formatNumber(gameState.balance));
    setText(".balance-value", formatNumber(gameState.balance));

    // Total mined
    setText(
        "#totalMined",
        formatNumber(gameState.totalMined)
    );

    setText(
        ".total-mined-value",
        formatNumber(gameState.totalMined)
    );

    // Mining rate
    setText(
        "#mineRate",
        formatMiningRate(effectiveRate) + " BSHIB/s"
    );

    setText(
        ".mine-rate",
        formatMiningRate(effectiveRate) + " BSHIB/s"
    );

    // Energy
    setText(
        "#energy",
        Math.floor(gameState.energy) +
        "/" +
        Math.floor(gameState.maxEnergy)
    );

    setText(
        ".energy-value",
        Math.floor(gameState.energy) +
        "/" +
        Math.floor(gameState.maxEnergy)
    );

    // Level
    setText(
        "#level",
        gameState.level
    );

    setText(
        ".level-value",
        gameState.level
    );

    // XP
    const requiredXP = getXpRequired(gameState.level);

    setText(
        "#xp",
        Math.floor(gameState.xp) +
        "/" +
        requiredXP
    );

    // Tap power
    setText(
        "#tapPower",
        formatMiningRate(effectiveTap)
    );

    // VIP
    const vip = VIP_LEVELS[gameState.vipLevel];

    if (vip) {
        setText(
            "#vipLevel",
            "VIP " + gameState.vipLevel
        );

        setText(
            ".vip-level",
            "VIP " + gameState.vipLevel
        );

        setText(
            "#vipName",
            vip.name
        );
    }

    updateProgressBars();
    updateUpgradeUI();
    updateVIPUI();
    updateReferralUI();
}

// ============================================================
// PROGRESS BARS
// ============================================================

function updateProgressBars() {
    const energyPercent =
        gameState.maxEnergy > 0
            ? (gameState.energy / gameState.maxEnergy) * 100
            : 0;

    const xpRequired = getXpRequired(gameState.level);

    const xpPercent =
        xpRequired > 0
            ? (gameState.xp / xpRequired) * 100
            : 0;

    document
        .querySelectorAll(
           
