// ==========================================
// BABY SHIBA INU - SHIBARIUM BASE
// APP VERSION 3.0
// Telegram + Standalone Web Support
// LocalStorage Fallback
// ==========================================


// ==========================================
// TELEGRAM
// ==========================================

let tg = window.Telegram?.WebApp || null;

let saveInProgress = false;
let savePending = false;

let telegramUser = null;
let user = null;


// ==========================================
// TELEGRAM ENVIRONMENT CHECK
// ==========================================

function isTelegramMiniApp() {

    return !!(
        tg &&
        typeof tg.initData === "string" &&
        tg.initData.length > 0
    );

}


// ==========================================
// CONNECT TELEGRAM
// ==========================================

function initTelegram() {

    tg = window.Telegram?.WebApp || null;

    if (!tg) {

        console.log(
            "🌐 Standalone Web Mode"
        );

        return;

    }

    try {

        tg.ready();
        tg.expand();

    } catch (error) {

        console.log(
            "Telegram init error:",
            error
        );

    }

    telegramUser =
        tg.initDataUnsafe?.user || null;

    console.log(
        "📱 Telegram WebApp detected:",
        isTelegramMiniApp()
    );

}


// ==========================================
// GET TELEGRAM USER
// ==========================================

function getTelegramUser() {

    if (
        isTelegramMiniApp()
    ) {

        const currentUser =
            tg.initDataUnsafe?.user || null;

        if (currentUser) {

            telegramUser =
                currentUser;

        }

    }

    if (telegramUser) {

        return {

            id:
                telegramUser.id || null,

            firstName:
                telegramUser.first_name ||
                "Player",

            lastName:
                telegramUser.last_name ||
                "",

            username:
                telegramUser.username ||
                ""

        };

    }

    return {

        id: null,

        firstName: "Guest",

        lastName: "",

        username: ""

    };

}


// ==========================================
// REFRESH USER
// ==========================================

function refreshUser() {

    user =
        getTelegramUser();

    console.log(
        "👤 Current User:",
        user
    );

    return user;

}


// ==========================================
// DISPLAY NAME
// ==========================================

function getUserDisplayName(targetUser) {

    if (!targetUser) {

        return "Player";

    }

    const firstName =
        targetUser.firstName ||
        targetUser.first_name ||
        "";

    const lastName =
        targetUser.lastName ||
        targetUser.last_name ||
        "";

    const fullName =
        (
            firstName +
            " " +
            lastName
        ).trim();

    if (fullName) {

        return fullName;

    }

    if (targetUser.username) {

        return (
            "@" +
            targetUser.username
        );

    }

    return "Player";

}


// ==========================================
// GAME STATE
// ==========================================

const defaultState = {

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


let game = {

    ...defaultState

};


// ==========================================
// REFERRAL
// ==========================================

const REFERRAL_REWARD = 3000;


// ==========================================
// VIP
// ==========================================

const VIP_LEVELS = {

    0: {

        name: "Free Member",

        miningBonus: 0,

        energyBonus: 0,

        dailyReward: 0,

        price: 0

    },

    1: {

        name: "VIP 1",

        miningBonus: 10,

        energyBonus: 100,

        dailyReward: 500,

        price: 10000

    },

    2: {

        name: "VIP 2",

        miningBonus: 25,

        energyBonus: 250,

        dailyReward: 1000,

        price: 50000

    },

    3: {

        name: "VIP 3",

        miningBonus: 50,

        energyBonus: 500,

        dailyReward: 2500,

        price: 150000

    },

    4: {

        name: "VIP 4",

        miningBonus: 75,

        energyBonus: 750,

        dailyReward: 5000,

        price: 400000

    },

    5: {

        name: "VIP 5",

        miningBonus: 100,

        energyBonus: 1000,

        dailyReward: 10000,

        price: 1000000

    }

};


// ==========================================
// VIP DATA
// ==========================================

function getVIPData() {

    const level =
        Number(game.vipLevel) || 0;

    return (
        VIP_LEVELS[level] ||
        VIP_LEVELS[0]
    );

}


function getVIPPrice(level) {

    const vip =
        VIP_LEVELS[level];

    if (!vip) {

        return 0;

    }

    return Number(vip.price) || 0;

}


function getEffectiveMineRate() {

    const vip =
        getVIPData();

    const baseRate =
        Number(game.mineRate) || 0;

    const bonus =
        vip.miningBonus || 0;

    return (
        baseRate *
        (
            1 +
            bonus / 100
        )
    );

}


function getEffectiveMaxEnergy() {

    const vip =
        getVIPData();

    const baseEnergy =
        Number(game.maxEnergy) || 0;

    const bonus =
        vip.energyBonus || 0;

    return (
        baseEnergy +
        bonus
    );

}


function getTodayDate() {

    const now =
        new Date();

    return (

        now.getFullYear() +
        "-" +
        String(
            now.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            now.getDate()
        ).padStart(2, "0")

    );

}


// ==========================================
// VIP PURCHASE
// ==========================================

function buyVIP(level) {

    const newLevel =
        Number(level);

    if (
        !Number.isInteger(newLevel) ||
        newLevel < 1 ||
        newLevel > 5
    ) {

        showToast(
            "❌ Invalid VIP level"
        );

        return;

    }

    if (
        newLevel <=
        Number(game.vipLevel)
    ) {

        showToast(
            "👑 You already have this VIP or higher"
        );

        return;

    }

    const vip =
        VIP_LEVELS[newLevel];

    if (!vip) {

        showToast(
            "❌ VIP not found"
        );

        return;

    }

    const cost =
        getVIPPrice(newLevel);

    if (
        game.balance <
        cost
    ) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;

    }

    game.balance -= cost;

    game.vipLevel =
        newLevel;

    const effectiveMaxEnergy =
        getEffectiveMaxEnergy();

    if (
        game.energy >
        effectiveMaxEnergy
    ) {

        game.energy =
            effectiveMaxEnergy;

    }

    game.vipRewardClaimed =
        false;

    game.vipLastRewardDate =
        "";

    saveGame();

    updateUI();

    if (
        tg &&
        tg.HapticFeedback
    ) {

        try {

            tg.HapticFeedback
                .impactOccurred("medium");

        } catch (error) {}

    }

    showToast(
        "👑 " +
        vip.name +
        " activated!"
    );

}


function claimVIPDailyReward() {

    const vip =
        getVIPData();

    if (
        game.vipLevel <= 0 ||
        vip.dailyReward <= 0
    ) {

        showToast(
            "🔒 VIP reward is locked"
        );

        return;

    }

    const today =
        getTodayDate();

    if (
        game.vipLastRewardDate ===
        today
    ) {

        showToast(
            "🎁 VIP reward already claimed"
        );

        return;

    }

    game.balance +=
        vip.dailyReward;

    game.vipLastRewardDate =
        today;

    game.vipRewardClaimed =
        true;

    saveGame();

    updateUI();

    showToast(
        "🎁 +" +
        formatNumber(
            vip.dailyReward
        ) +
        " BSHIB VIP Reward"
    );

}


function setVIPLevel(level) {

    const newLevel =
        Number(level);

    if (
        !Number.isInteger(newLevel) ||
        newLevel < 0 ||
        newLevel > 5
    ) {

        return;

    }

    game.vipLevel =
        newLevel;

    const effectiveMax =
        getEffectiveMaxEnergy();

    if (
        game.energy >
        effectiveMax
    ) {

        game.energy =
            effectiveMax;

    }

    saveGame();

    updateUI();

}


// ==========================================
// REFERRAL
// ==========================================

function generateReferralCode() {

    if (game.referralCode) {

        return game.referralCode;

    }

    if (user && user.id) {

        game.referralCode =
            "BSHIB" +
            String(user.id);

    } else {

        game.referralCode =
            "BSHIBGUEST";

    }

    saveGame();

    return game.referralCode;

}


function getReferralCode() {

    if (game.referralCode) {

        return game.referralCode;

    }

    if (user && user.id) {

        return (
            "BSHIB" +
            String(user.id)
        );

    }

    return "BSHIBGUEST";

}


function getReferralLink() {

    const code =
        getReferralCode();

    return (

        "https://t.me/" +
        "shibababycoinbot" +
        "?startapp=" +
        encodeURIComponent(code)

    );

}


function getIncomingReferral() {

    if (
        !isTelegramMiniApp()
    ) {

        return "";

    }

    const startParam =
        tg.initDataUnsafe?.start_param;

    if (!startParam) {

        return "";

    }

    return String(startParam);

}


function createReferralUserData() {

    const currentUser =
        getTelegramUser();

    return {

        id:
            currentUser.id || null,

        firstName:
            currentUser.firstName ||
            "Player",

        lastName:
            currentUser.lastName ||
            "",

        username:
            currentUser.username ||
            "",

        displayName:
            getUserDisplayName(
                currentUser
            ),

        joinedAt:
            new Date().toISOString(),

        reward:
            REFERRAL_REWARD,

        rewardPaid:
            false

    };

}


function processReferral() {

    const incomingReferral =
        getIncomingReferral();

    if (!incomingReferral) {

        return;

    }

    if (
        game.referralProcessed ||
        game.referredBy
    ) {

        return;

    }

    const myCode =
        getReferralCode();

    if (
        incomingReferral ===
        myCode
    ) {

        return;

    }

    if (
        !incomingReferral.startsWith(
            "BSHIB"
        )
    ) {

        return;

    }

    game.referredBy =
        incomingReferral;

    game.referralProcessed =
        true;

    game.pendingReferral = {

        inviterCode:
            incomingReferral,

        invitedUser:
            createReferralUserData(),

        status:
            "pending_serverless",

        createdAt:
            new Date().toISOString()

    };

    saveGame();

    updateUI();

    showToast(
        "🔗 Referral recorded!"
    );

}


// ==========================================
// LOCAL STORAGE
// ==========================================

function getGameStorageKey() {

    if (
        user &&
        user.id
    ) {

        return (
            "babyShibaGame_" +
            String(user.id)
        );

    }

    return "babyShibaGame_GUEST";

}


function saveLocalBackup() {

    try {

        const key =
            getGameStorageKey();

        localStorage.setItem(
            key,
            JSON.stringify(game)
        );

    } catch (error) {

        console.log(
            "❌ Local save error:",
            error
        );

    }

}


function loadLocalBackup() {

    try {

        const key =
            getGameStorageKey();

        const saved =
            localStorage.getItem(key);

        if (!saved) {

            return false;

        }

        const parsed =
            JSON.parse(saved);

        game = {

            ...defaultState,

            ...parsed

        };

        return true;

    } catch (error) {

        console.log(
            "❌ Local load error:",
            error
        );

        return false;

    }

}


// ==========================================
// SAVE GAME
// ==========================================

function saveGame() {

    saveLocalBackup();

    /*
     * IMPORTANT:
     * CloudStorage is used only inside
     * the real Telegram Mini App.
     */

    if (
        !isTelegramMiniApp()
    ) {

        return;

    }

    if (saveInProgress) {

        savePending = true;

        return;

    }

    try {

        const storage =
            tg.CloudStorage;

        if (
            !storage ||
            typeof storage.setItem !==
            "function"
        ) {

            return;

        }

        saveInProgress =
            true;

        savePending =
            false;

        storage.setItem(

            "game",

            JSON.stringify(game),

            function(error) {

                saveInProgress =
                    false;

                if (savePending) {

                    saveGame();

                }

            }

        );

    } catch (error) {

        saveInProgress =
            false;

        console.log(
            "Cloud save skipped:",
            error
        );

    }

}


// ==========================================
// LOAD GAME
// ==========================================

function loadGameFromTelegram() {

    /*
     * GitHub Pages / normal browser:
     * immediately use localStorage.
     */

    if (
        !isTelegramMiniApp()
    ) {

        console.log(
            "🌐 Standalone mode - LocalStorage"
        );

        loadLocalBackup();

        return Promise.resolve(true);

    }


    const storage =
        tg.CloudStorage;

    if (
        !storage ||
        typeof storage.getItem !==
        "function"
    ) {

        loadLocalBackup();

        return Promise.resolve(true);

    }


    return new Promise((resolve) => {

        let completed = false;

        function finish(result) {

            if (completed) {

                return;

            }

            completed = true;

            resolve(result);

        }

        /*
         * Safety timeout.
         * The UI will never remain blocked
         * waiting for CloudStorage.
         */

        const timeout =
            setTimeout(() => {

                console.log(
                    "⚠️ CloudStorage timeout - using local backup"
                );

                finish(
                    loadLocalBackup()
                );

            }, 1500);


        try {

            storage.getItem(

                "game",

                function(error, value) {

                    clearTimeout(timeout);

                    if (error) {

                        finish(
                            loadLocalBackup()
                        );

                        return;

                    }

                    if (!value) {

                        const loaded =
                            loadLocalBackup();

                        if (!loaded) {

                            game = {
                                ...defaultState
                            };

                        }

                        finish(true);

                        return;

                    }

                    try {

                        game = {

                            ...defaultState,

                            ...JSON.parse(value)

                        };

                        saveLocalBackup();

                        finish(true);

                    } catch (error) {

                        finish(
                            loadLocalBackup()
                        );

                    }

                }

            );

        } catch (error) {

            clearTimeout(timeout);

            finish(
                loadLocalBackup()
            );

        }

    });

}


// ==========================================
// PAGE SYSTEM
// ==========================================

function showPage(pageId) {

    const pages =
        document.querySelectorAll(
            ".game-page"
        );

    pages.forEach(page => {

        page.classList.remove(
            "active"
        );

    });

    const selected =
        document.getElementById(
            pageId
        );

    if (selected) {

        selected.classList.add(
            "active"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

    updateNavigation(pageId);

}


// ==========================================
// NAVIGATION
// ==========================================

function updateNavigation(pageId) {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(item => {

        if (
            item.dataset.page ===
            pageId
        ) {

            item.classList.add(
                "active"
            );

        } else {

            item.classList.remove(
                "active"
            );

        }

    });

}


function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(item => {

        item.addEventListener(
            "click",
            function() {

                const pageId =
                    item.dataset.page;

                if (pageId) {

                    showPage(pageId);

                }

            }
        );

    });

}


// ==========================================
// START GAME
// ==========================================

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

        intro.classList.add(
            "hidden"
        );

    }

    if (gameApp) {

        gameApp.classList.remove(
            "hidden"
        );

    }

    showPage(
        "miningPage"
    );

    if (
        isTelegramMiniApp() &&
        tg.HapticFeedback
    ) {

        try {

            tg.HapticFeedback
                .impactOccurred(
                    "medium"
                );

        } catch (error) {}

    }

}


// ==========================================
// PLAYER INFO
// ==========================================

function updatePlayerInfo() {

    const nameElement =
        document.getElementById(
            "playerName"
        );

    const idElement =
        document.getElementById(
            "playerId"
        );

    if (nameElement) {

        if (
            user &&
            user.username
        ) {

            nameElement.textContent =
                "@" +
                user.username;

        } else {

            nameElement.textContent =

                (
                    user &&
                    user.firstName
                )
                    ? user.firstName
                    : "Player";

        }

    }

    if (idElement) {

        idElement.textContent =

            user &&
            user.id

                ? "Telegram ID: " +
                  user.id

                : "Web3 Guest";

    }

}


// ==========================================
// UI
// ==========================================

function updateUI() {

    const balance =
        document.getElementById(
            "balance"
        );

    const totalMined =
        document.getElementById(
            "totalMined"
        );

    const level =
        document.getElementById(
            "level"
        );

    const levelName =
        document.getElementById(
            "levelName"
        );

    const xpFill =
        document.getElementById(
            "xpFill"
        );

    const tapPower =
        document.getElementById(
            "tapPower"
        );

    const energy =
        document.getElementById(
            "energy"
        );

    const maxEnergy =
        document.getElementById(
            "maxEnergy"
        );

    const energyFill =
        document.getElementById(
            "energyFill"
        );

    const mineRate =
        document.getElementById(
            "mineRate"
        );

    const statsMineRate =
        document.getElementById(
            "statsMineRate"
        );

    const tapCost =
        document.getElementById(
            "tapCost"
        );

    const energyCost =
        document.getElementById(
            "energyCost"
        );

    const boostCost =
        document.getElementById(
            "boostCost"
        );


    if (balance) {

        balance.textContent =
            formatNumber(
                game.balance
            );

    }


    if (totalMined) {

        totalMined.textContent =
            formatNumber(
                game.totalMined
            );

    }


    if (level) {

        level.textContent =
            game.level;

    }


    if (levelName) {

        levelName.textContent =
            getLevelName(
                game.level
            );

    }


    if (tapPower) {

        tapPower.textContent =
            game.tapPower;

    }


    const effectiveMaxEnergy =
        getEffectiveMaxEnergy();

    if (energy) {

        energy.textContent =
            Math.floor(
                game.energy
            );

    }


    if (maxEnergy) {

        maxEnergy.textContent =
            effectiveMaxEnergy;

    }


    const effectiveMineRate =
        getEffectiveMineRate();

    if (mineRate) {

        mineRate.textContent =
            formatMiningRate(
                effectiveMineRate
            ) +
            " BSHIB/s";

    }


    if (statsMineRate) {

        statsMineRate.textContent =
            formatMiningRate(
                effectiveMineRate
            );

    }


    if (energyFill) {

        const percent =
            (
                game.energy /
                effectiveMaxEnergy
            ) * 100;

        energyFill.style.width =

            Math.max(
                0,
                Math.min(
                    100,
                    percent
                )
            ) + "%";

    }


    if (xpFill) {

        const required =
            game.level * 1000;

        const percent =
            (
                game.xp /
                required
            ) * 100;

        xpFill.style.width =

            Math.max(
                0,
                Math.min(
                    100,
                    percent
                )
            ) + "%";

    }


    if (tapCost) {

        tapCost.textContent =
            formatNumber(
                getTapCost()
            );

    }


    if (energyCost) {

        energyCost.textContent =
            formatNumber(
                getEnergyCost()
            );

    }


    if (boostCost) {

        boostCost.textContent =
            formatNumber(
                getBoostCost()
            );

    }


    const refCode =
        document.getElementById(
            "refCode"
        );

    if (refCode) {

        refCode.textContent =
            getReferralCode();

    }


    const vip =
        getVIPData();


    const vipLevel =
        document.getElementById(
            "vipLevel"
        );

    const vipMiningBonus =
        document.getElementById(
            "vipMiningBonus"
        );

    const vipEnergyBonus =
        document.getElementById(
            "vipEnergyBonus"
        );

    const vipDailyReward =
        document.getElementById(
            "vipDailyReward"
        );

    const vipCurrentName =
        document.getElementById(
            "vipCurrentName"
        );


    if (vipLevel) {

        vipLevel.textContent =
            "VIP " +
            game.vipLevel;

    }


    if (vipMiningBonus) {

        vipMiningBonus.textContent =
            "+" +
            vip.miningBonus +
            "%";

    }


    if (vipEnergyBonus) {

        vipEnergyBonus.textContent =
            "+" +
            vip.energyBonus;

    }


    if (vipDailyReward) {

        if (
            vip.dailyReward > 0
        ) {

            vipDailyReward.textContent =
                formatNumber(
                    vip.dailyReward
                ) +
                " BSHIB";

        } else {

            vipDailyReward.textContent =
                "Locked";

        }

    }


    if (vipCurrentName) {

        vipCurrentName.textContent =
            vip.name;

    }


    const vipDailyButton =
        document.getElementById(
            "claimVipReward"
        );

    if (vipDailyButton) {

        if (
            game.vipLevel <= 0
        ) {

            vipDailyButton.disabled =
                true;

            vipDailyButton.textContent =
                "🔒 VIP Reward Locked";

        } else if (
            game.vipLastRewardDate ===
            getTodayDate()
        ) {

            vipDailyButton.disabled =
                true;

            vipDailyButton.textContent =
                "✅ Reward Claimed";

        } else {

            vipDailyButton.disabled =
                false;

            vipDailyButton.textContent =
                "🎁 Claim VIP Reward";

        }

    }


    for (
        let levelNumber = 1;
        levelNumber <= 5;
        levelNumber++
    ) {

        const card =
            document.querySelector(
                '[data-vip-level="' +
                levelNumber +
                '"]'
            );

        if (!card) {

            continue;

        }

        const buyButton =
            card.querySelector(
                ".vip-buy-btn"
            );

        const priceElement =
            card.querySelector(
                ".vip-price"
            );

        const vipCardData =
            VIP_LEVELS[
                levelNumber
            ];

        if (priceElement) {

            priceElement.textContent =
                formatNumber(
                    vipCardData.price
                ) +
                " BSHIB";

        }

        if (buyButton) {

            if (
                game.vipLevel >=
                levelNumber
            ) {

                buyButton.disabled =
                    true;

                buyButton.textContent =
                    "✅ Active";

            } else {

                buyButton.disabled =
                    false;

                buyButton.textContent =
                    "👑 Activate VIP " +
                    levelNumber;

            }

        }

        if (
            game.vipLevel ===
            levelNumber
        ) {

            card.classList.add(
                "current-vip"
            );

        } else {

            card.classList.remove(
                "current-vip"
            );

        }

    }

}


// ==========================================
// NUMBER
// ==========================================

function formatNumber(number) {

    return Math.floor(
        Number(number) || 0
    ).toLocaleString(
        "en-US"
    );

}


function formatMiningRate(number) {

    if (
        Number.isInteger(number)
    ) {

        return String(number);

    }

    return Number(number).toFixed(2);

}


function getLevelName(level) {

    if (level >= 20) {

        return "Shiba Legend";

    }

    if (level >= 15) {

        return "Shiba Master";

    }

    if (level >= 10) {

        return "Shiba Elite";

    }

    if (level >= 5) {

        return "Shiba Warrior";

    }

    return "Shiba Rookie";

}


// ==========================================
// XP
// ==========================================

function addXP(amount) {

    game.xp += amount;

    const required =
        game.level * 1000;

    if (
        game.xp >= required
    ) {

        game.xp -= required;

        game.level++;

        showToast(
            "🎉 Level Up! Level " +
            game.level
        );

    }

}


// ==========================================
// MINING
// ==========================================

function mine() {

    if (
        game.energy <= 0
    ) {

        showToast(
            "⚡ Energy is empty!"
        );

        return;

    }

    const effectiveMineRate =
        getEffectiveMineRate();

    const amount =

        game.tapPower +
        effectiveMineRate -
        1;

    game.balance +=
        amount;

    game.totalMined +=
        amount;

    game.energy -=
        1;

    game.missionProgress +=
        amount;

    addXP(amount);

    createCoinEffect(
        amount
    );

    if (
        isTelegramMiniApp() &&
        tg.HapticFeedback
    ) {

        try {

            tg.HapticFeedback
                .impactOccurred(
                    "light"
                );

        } catch (error) {}

    }

    saveGame();

    updateUI();

}


// ==========================================
// AUTO MINING
// ==========================================

setInterval(() => {

    if (
        game.energy <= 0
    ) {

        return;

    }

    const amount =
        getEffectiveMineRate();

    game.balance +=
        amount;

    game.totalMined +=
        amount;

    game.energy -=
        1;

    game.missionProgress +=
        amount;

    addXP(amount);

    saveGame();

    updateUI();

}, 1000);


// ==========================================
// ENERGY REGEN
// ==========================================

setInterval(() => {

    const effectiveMaxEnergy =
        getEffectiveMaxEnergy();

    if (
        game.energy <
        effectiveMaxEnergy
    ) {

        game.energy += 5;

        if (
            game.energy >
            effectiveMaxEnergy
        ) {

            game.energy =
                effectiveMaxEnergy;

        }

        saveGame();

        updateUI();

    }

}, 1000);


// ==========================================
// UPGRADE COSTS
// ==========================================

function getTapCost() {

    return Math.floor(

        100 *

        Math.pow(
            1.6,
            game.tapLevel - 1
        )

    );

}


function getEnergyCost() {

    return Math.floor(

        250 *

        Math.pow(
            1.7,
            game.energyLevel - 1
        )

    );

}


function getBoostCost() {

    return Math.floor(

        500 *

        Math.pow(
            1.8,
            game.boostLevel - 1
        )

    );

}


// ==========================================
// UPGRADES
// ==========================================

function upgradeTap() {

    const cost =
        getTapCost();

    if (
        game.balance <
        cost
    ) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;

    }

    game.balance -=
        cost;

    game.tapPower +=
        1;

    game.tapLevel +=
        1;

    saveGame();

    updateUI();

    showToast(
        "⚡ Tap Power upgraded!"
    );

}


function upgradeEnergy() {

    const cost =
        getEnergyCost();

    if (
        game.balance <
        cost
    ) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;

    }

    game.balance -=
        cost;

    game.maxEnergy +=
        250;

    game.energyLevel +=
        1;

    game.energy =
        getEffectiveMaxEnergy();

    saveGame();

    updateUI();

    showToast(
        "🔋 Energy upgraded!"
    );

}


function upgradeBoost() {

    const cost =
        getBoostCost();

    if (
        game.balance <
        cost
    ) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;

    }

    game.balance -=
        cost;

    game.mineRate +=
        1;

    game.boostLevel +=
        1;

    saveGame();

    updateUI();

    showToast(
        "🚀 Mining Boost upgraded!"
    );

}


// ==========================================
// REFERRAL UI
// ==========================================

function setupReferral() {

    const refCode =
        document.getElementById(
            "refCode"
        );

    if (refCode) {

        refCode.textContent =
            getReferralCode();

    }

}


// ==========================================
// COPY REFERRAL
// ==========================================

function copyReferral() {

    const code =
        getReferralCode();

    if (
        navigator.clipboard
    ) {

        navigator.clipboard
            .writeText(code)
            .then(() => {

                showToast(
                    "📋 Referral copied!"
                );

            })
            .catch(() => {

                showToast(
                    "Copy failed"
                );

            });

    } else {

        showToast(
            "Copy not available"
        );

    }

}


// ==========================================
// INVITE FRIENDS
// ==========================================

function inviteFriends() {

    const link =
        getReferralLink();

    const shareUrl =

        "https://t.me/share/url?url=" +
        encodeURIComponent(link) +
        "&text=" +
        encodeURIComponent(
            "🐕 Join Baby Shiba Inu Mining!"
        );


    if (
        isTelegramMiniApp() &&
        tg.openTelegramLink
    ) {

        tg.openTelegramLink(
            shareUrl
        );

    } else if (
        navigator.clipboard
    ) {

        navigator.clipboard
            .writeText(link)
            .then(() => {

                showToast(
                    "📨 Invite link copied!"
                );

            });

    }

}


// ==========================================
// MISSION
// ==========================================

function claimMission() {

    if (
        game.missionProgress <
        1000
    ) {

        showToast(
            "🎯 Mission not completed"
        );

        return;

    }

    if (
        game.missionClaimed
    ) {

        showToast(
            "✅ Mission already claimed"
        );

        return;

    }

    game.balance +=
        100;

    game.missionClaimed =
        true;

    saveGame();

    updateUI();

    showToast(
        "🎁 +100 BSHIB Mission Reward"
    );

}


// ==========================================
// WALLET
// ==========================================

function connectWallet() {

    showToast(
        "🔐 Wallet coming soon"
    );

}


// ==========================================
// SOUND
// ==========================================

function toggleSound() {

    game.sound =
        !game.sound;

    const button =
        document.getElementById(
            "soundBtn"
        );

    if (button) {

        button.textContent =
            game.sound
                ? "🔊"
                : "🔇";

    }

    saveGame();

}


// ==========================================
// TOAST
// ==========================================

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

    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 2200);

}


// ==========================================
// COIN EFFECT
// ==========================================

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
        "coin-effect";

    coin.textContent =
        "+" +
        formatMiningRate(amount);

    coin.style.left =

        (
            45 +
            Math.random() * 10
        ) +
        "%";

    coin.style.top =
        "45%";

    effects.appendChild(
        coin
    );

    setTimeout(() => {

        coin.remove();

    }, 1000);

}


// ==========================================
// SHOP
// ==========================================

function buyEnergyPack() {

    const cost = 250;

    const effectiveMaxEnergy =
        getEffectiveMaxEnergy();

    if (
        game.energy >=
        effectiveMaxEnergy
    ) {

        showToast(
            "⚡ Energy is already full!"
        );

        return;

    }

    if (
        game.balance <
        cost
    ) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;

    }

    game.balance -=
        cost;

    game.energy =

        Math.min(

            game.energy + 500,

            effectiveMaxEnergy

        );

    saveGame();

    updateUI();

    showToast(
        "⚡ +500 Energy!"
    );

}


function buyMiningBoost() {

    const cost = 500;

    if (
        game.balance <
        cost
    ) {

        showToast(
            "❌ Not enough BSHIB"
        );

        return;

    }

    game.balance -=
        cost;

    game.mineRate +=
        1;

    saveGame();

    updateUI();

    showToast(
        "🚀 Mining Boost +1!"
    );

}


// ==========================================
// BUTTONS
// ==========================================

function setupButtons() {

    const startButton =
        document.getElementById(
            "startGame"
        );

    const mineButton =
        document.getElementById(
            "shibaButton"
        );

    const soundButton =
        document.getElementById(
            "soundBtn"
        );

    const upgradeTapButton =
        document.getElementById(
            "upgradeTap"
        );

    const upgradeEnergyButton =
        document.getElementById(
            "upgradeEnergy"
        );

    const upgradeBoostButton =
        document.getElementById(
            "upgradeBoost"
        );

    const buyEnergyPackButton =
        document.getElementById(
            "buyEnergyPack"
        );

    const buyMiningBoostButton =
        document.getElementById(
            "buyMiningBoost"
        );

    const copyRefButton =
        document.getElementById(
            "copyRef"
        );

    const inviteButton =
        document.getElementById(
            "inviteBtn"
        );

    const claimMissionButton =
        document.getElementById(
            "claimMission"
        );

    const walletButton =
        document.getElementById(
            "walletBtn"
        );

    const claimVIPButton =
        document.getElementById(
            "claimVipReward"
        );


    if (startButton) {

        startButton.onclick =
            startGame;

    }


    if (mineButton) {

        mineButton.onclick =
            mine;

    }


    if (soundButton) {

        soundButton.onclick =
            toggleSound;

    }


    if (upgradeTapButton) {

        upgradeTapButton.onclick =
            upgradeTap;

    }


    if (upgradeEnergyButton) {

        upgradeEnergyButton.onclick =
            upgradeEnergy;

    }


    if (upgradeBoostButton) {

        upgradeBoostButton.onclick =
            upgradeBoost;

    }


    if (buyEnergyPackButton) {

        buyEnergyPackButton.onclick =
            buyEnergyPack;

    }


    if (buyMiningBoostButton) {

        buyMiningBoostButton.onclick =
            buyMiningBoost;

    }


    if (copyRefButton) {

        copyRefButton.onclick =
            copyReferral;

    }


    if (inviteButton) {

        inviteButton.onclick =
            inviteFriends;

    }


    if (claimMissionButton) {

        claimMissionButton.onclick =
            claimMission;

    }


    if (walletButton) {

        walletButton.onclick =
            connectWallet;

    }


    if (claimVIPButton) {

        claimVIPButton.onclick =
            claimVIPDailyReward;

    }


    const vipBuyButtons =
        document.querySelectorAll(
            ".vip-buy-btn"
        );

    vipBuyButtons.forEach(
        button => {

            button.onclick =
                function() {

                    const level =
                        Number(
                            this.dataset.vipLevel
                        );

                    buyVIP(level);

                };

        }
    );

}


// ==========================================
// INITIALIZE
// ==========================================

async function initApp() {

    /*
     * IMPORTANT:
     * Buttons are connected BEFORE
     * any storage loading.
     * Therefore GitHub Pages can
     * never block START MINING.
     */

    initTelegram();

    refreshUser();

    setupButtons();

    setupNavigation();

    updatePlayerInfo();

    setupReferral();

    updateUI();


    /*
     * Load saved game.
     */

    await loadGameFromTelegram();


    refreshUser();


    if (
        typeof game.vipLevel !==
        "number"
    ) {

        game.vipLevel = 0;

    }


    if (
        game.vipLevel < 0 ||
        game.vipLevel > 5
    ) {

        game.vipLevel = 0;

    }


    if (
        typeof game.vipRewardClaimed !==
        "boolean"
    ) {

        game.vipRewardClaimed =
            false;

    }


    if (
        typeof game.vipLastRewardDate !==
        "string"
    ) {

        game.vipLastRewardDate =
            "";

    }


    generateReferralCode();

    processReferral();


    updatePlayerInfo();

    setupReferral();

    updateUI();


    console.log(
        "🐕 Baby Shiba Inu App 3.0 Ready"
    );

    console.log(
        "🌐 Telegram Mini App:",
        isTelegramMiniApp()
    );

}


// ==========================================
// START
// ==========================================

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


// ==========================================
// SAVE WHEN APP HIDDEN
// ==========================================

document.addEventListener(
    "visibilitychange",
    function() {

        if (
            document.visibilityState ===
            "hidden"
        ) {

            saveGame();

        }

    }
);
