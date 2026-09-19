// ==========================================
// BABY SHIBA INU - MINI APP
// APP VERSION 2.5
// Stable User + CloudStorage + Local Backup
// Referral Ready for Telegram Serverless
// VIP Test Purchase System
// ==========================================

// ==========================================
// TELEGRAM
// ==========================================

let tg =
window.Telegram?.WebApp || null;

let saveInProgress = false;
let savePending = false;

// ==========================================
// TELEGRAM USER
// ==========================================

let telegramUser = null;
let user = null;

// ==========================================
// CONNECT TELEGRAM
// ==========================================

function initTelegram() {

tg =  
    window.Telegram?.WebApp || null;  

if (!tg) {  

    console.log(  
        "⚠️ Telegram WebApp not available"  
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
    "📱 Telegram Mini App connected"  
);  

console.log(  
    "Telegram User:",  
    telegramUser  
);

}

// ==========================================
// GET TELEGRAM USER
// ==========================================

function getTelegramUser() {

if (tg) {  

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

const currentUser =  
    getTelegramUser();  

user =  
    currentUser;  

console.log(  
    "👤 Current User:",  
    user  
);  

return user;

}

// ==========================================
// GET DISPLAY NAME
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


// ==========================================  
// VIP  
// ==========================================  

vipLevel: 0,  

vipRewardClaimed: false,  

vipLastRewardDate: "",  


// ==========================================  
// REFERRAL  
// ==========================================  

referralCode: "",  

referralCount: 0,  

referralEarnings: 0,  

referredBy: "",  

referrals: [],  


// ==========================================  
// REFERRAL READY DATA  
// ==========================================  

pendingReferral: null,  

referralProcessed: false

};

let game = {

...defaultState

};

// ==========================================
// REFERRAL SETTINGS
// ==========================================

const REFERRAL_REWARD = 3000;

// ==========================================
// VIP SETTINGS
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
// GET VIP DATA
// ==========================================

function getVIPData() {

const level =  
    Number(game.vipLevel) || 0;  

return (  
    VIP_LEVELS[level] ||  
    VIP_LEVELS[0]  
);

}

// ==========================================
// GET VIP PRICE
// ==========================================

function getVIPPrice(level) {

const vip =  
    VIP_LEVELS[level];  

if (!vip) {  

    return 0;  

}  

return (  
    Number(vip.price) || 0  
);

}

// ==========================================
// VIP MINING RATE
// ==========================================

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

// ==========================================
// VIP MAX ENERGY
// ==========================================

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

// ==========================================
// TODAY DATE
// ==========================================

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
// BUY VIP
// ==========================================

function buyVIP(level) {

const newLevel =  
    Number(level);  

if (  
    !Number.isInteger(  
        newLevel  
    )  
) {  

    showToast(  
        "❌ Invalid VIP level"  
    );  

    return;  

}  


if (  
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
    getVIPPrice(  
        newLevel  
    );  


if (  
    game.balance <  
    cost  
) {  

    showToast(  
        "❌ Not enough BSHIB"  
    );  

    return;  

}  


// --------------------------------------  
// PAY  
// --------------------------------------  

game.balance -=  
    cost;  


// --------------------------------------  
// ACTIVATE VIP  
// --------------------------------------  

game.vipLevel =  
    newLevel;  


// --------------------------------------  
// UPDATE ENERGY  
// --------------------------------------  

const effectiveMaxEnergy =  
    getEffectiveMaxEnergy();  


if (  
    game.energy >  
    effectiveMaxEnergy  
) {  

    game.energy =  
        effectiveMaxEnergy;  

}  


// --------------------------------------  
// RESET DAILY REWARD  
// --------------------------------------  

game.vipRewardClaimed =  
    false;  

game.vipLastRewardDate =  
    "";  


// --------------------------------------  
// SAVE  
// --------------------------------------  

saveGame();  

updateUI();  


// --------------------------------------  
// HAPTIC  
// --------------------------------------  

if (  
    tg &&  
    tg.HapticFeedback  
) {  

    tg.HapticFeedback  
        .impactOccurred(  
            "medium"  
        );  

}  


// --------------------------------------  
// MESSAGE  
// --------------------------------------  

showToast(  

    "👑 " +  
    vip.name +  
    " activated!"  

);  


console.log(  
    "👑 VIP purchased:",  
    newLevel,  
    vip  
);

}

// ==========================================
// CLAIM VIP DAILY REWARD
// ==========================================

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

// ==========================================
// SET VIP LEVEL
// ==========================================
// Reserved for future real payment/backend
// integration.
// ==========================================

function setVIPLevel(level) {

const newLevel =  
    Number(level);  

if (  
    !Number.isInteger(  
        newLevel  
    )  
) {  

    return;  

}  

if (  
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


console.log(  
    "👑 VIP level changed:",  
    game.vipLevel  
);

}

// ==========================================
// REFERRAL CODE
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

// ==========================================
// GET REFERRAL CODE
// ==========================================

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

// ==========================================
// GET REFERRAL LINK
// ==========================================

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

// ==========================================
// READ INCOMING REFERRAL
// ==========================================

function getIncomingReferral() {

if (!tg) {  

    return "";  

}  

const startParam =  
    tg.initDataUnsafe?.start_param;  

if (!startParam) {  

    return "";  

}  

return String(startParam);

}

// ==========================================
// CREATE REFERRAL USER DATA
// ==========================================

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

// ==========================================
// PROCESS INCOMING REFERRAL
// ==========================================

function processReferral() {

const incomingReferral =  
    getIncomingReferral();  

if (!incomingReferral) {  

    return;  

}  

console.log(  
    "🔗 Incoming referral:",  
    incomingReferral  
);  


if (  
    game.referralProcessed ||  
    game.referredBy  
) {  

    console.log(  
        "ℹ️ Referral already processed:",  
        game.referredBy  
    );  

    return;  

}  


const myCode =  
    getReferralCode();  


if (  
    incomingReferral ===  
    myCode  
) {  

    console.log(  
        "❌ Self referral blocked"  
    );  

    return;  

}  


if (  
    !incomingReferral.startsWith(  
        "BSHIB"  
    )  
) {  

    console.log(  
        "⚠️ Invalid BSHIB referral code:",  
        incomingReferral  
    );  

    return;  

}  


game.referredBy =  
    incomingReferral;  


game.referralProcessed =  
    true;  


const referralUser =  
    createReferralUserData();  


game.pendingReferral = {  

    inviterCode:  
        incomingReferral,  

    invitedUser:  
        referralUser,  

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


console.log(  
    "✅ Referral ready for Serverless:",  
    game.pendingReferral  
);

}

// ==========================================
// LOCAL STORAGE KEY
// ==========================================

function getGameStorageKey() {

if (user && user.id) {  

    return (  
        "babyShibaGame_" +  
        String(user.id)  
    );  

}  

return "babyShibaGame_GUEST";

}

// ==========================================
// LOCAL BACKUP SAVE
// ==========================================

function saveLocalBackup() {

try {  

    const key =  
        getGameStorageKey();  

    const data =  
        JSON.stringify(game);  

    localStorage.setItem(  
        key,  
        data  
    );  

    console.log(  
        "💾 Local backup saved:",  
        key  
    );  

} catch (error) {  

    console.log(  
        "❌ Local backup save error:",  
        error  
    );  

}

}

// ==========================================
// LOCAL BACKUP LOAD
// ==========================================

function loadLocalBackup() {

try {  

    const key =  
        getGameStorageKey();  

    const saved =  
        localStorage.getItem(  
            key  
        );  

    if (!saved) {  

        return false;  

    }  

    const parsed =  
        JSON.parse(saved);  

    game = {  

        ...defaultState,  

        ...parsed  

    };  

    console.log(  
        "💾 Local backup loaded:",  
        game  
    );  

    return true;  

} catch (error) {  

    console.log(  
        "❌ Local backup load error:",  
        error  
    );  

    return false;  

}

}

// ==========================================
// TELEGRAM CLOUD STORAGE SAVE
// ==========================================

function saveGame() {

saveLocalBackup();  


if (saveInProgress) {  

    savePending = true;  

    return;  

}  


try {  

    const storage =  

        window.Telegram &&  

        Telegram.WebApp &&  

        Telegram.WebApp.CloudStorage;  


    if (!storage) {  

        console.log(  
            "⚠️ CloudStorage unavailable - local backup used"  
        );  

        return;  

    }  


    saveInProgress = true;  

    savePending = false;  


    const data =  
        JSON.stringify(game);  


    storage.setItem(  

        "game",  

        data,  

        function(error, success) {  

            saveInProgress = false;  


            if (error) {  

                console.log(  
                    "❌ CloudStorage save error:",  
                    error  
                );  

            } else {  

                console.log(  
                    "☁️ CloudStorage saved:",  
                    success  
                );  

            }  


            if (savePending) {  

                saveGame();  

            }  

        }  

    );  


} catch (error) {  

    saveInProgress = false;  

    console.log(  
        "❌ Save exception:",  
        error  
    );  

}

}

// ==========================================
// LOAD FROM TELEGRAM CLOUD STORAGE
// ==========================================

async function loadGameFromTelegram() {

return new Promise((resolve) => {  

    const storage =  

        window.Telegram &&  

        Telegram.WebApp &&  

        Telegram.WebApp.CloudStorage;  


    if (!storage) {  

        console.log(  
            "⚠️ CloudStorage unavailable"  
        );  


        const localLoaded =  
            loadLocalBackup();  


        resolve(localLoaded);  

        return;  

    }  


    storage.getItem(  

        "game",  

        function(error, value) {  

            if (error) {  

                console.log(  
                    "❌ CloudStorage load error:",  
                    error  
                );  


                const localLoaded =  
                    loadLocalBackup();  


                resolve(localLoaded);  

                return;  

            }  


            console.log(  
                "☁️ CloudStorage data:",  
                value  
            );  


            if (!value) {  

                console.log(  
                    "🆕 No CloudStorage data"  
                );  


                const localLoaded =  
                    loadLocalBackup();  


                if (!localLoaded) {  

                    game = {  

                        ...defaultState  

                    };  

                }  


                resolve(true);  

                return;  

            }  


            try {  

                const savedGame =  
                    JSON.parse(value);  


                game = {  

                    ...defaultState,  

                    ...savedGame  

                };  


                saveLocalBackup();  


                console.log(  
                    "✅ Game loaded from CloudStorage:",  
                    game  
                );  


                resolve(true);  


            } catch (error) {  

                console.log(  
                    "❌ CloudStorage data error:",  
                    error  
                );  


                const localLoaded =  
                    loadLocalBackup();  


                resolve(localLoaded);  

            }  

        }  

    );  

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

// ==========================================
// SETUP NAVIGATION
// ==========================================

function setupNavigation() {

const navItems =  
    document.querySelectorAll(  
        ".nav-item"  
    );  


navItems.forEach(item => {  

    item.addEventListener(  

        "click",  

        () => {  

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
    tg &&  
    tg.HapticFeedback  
) {  

    tg.HapticFeedback  
        .impactOccurred(  
            "medium"  
        );  

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

                    ? user.firstName  

                    : "Player"  

            ) +  

            (  

                user &&  
                user.lastName  

                    ? " " +  
                      user.lastName  

                    : ""  

            );  

    }  

}  


if (idElement) {  

    idElement.textContent =  

        user &&  
        user.id  

            ? "Telegram ID: " +  
              user.id  

            : "Telegram ID: Guest";  

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


const missionProgress =  
    document.getElementById(  
        "missionProgress"  
    );  


const missionFill =  
    document.getElementById(  
        "missionFill"  
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


// --------------------------------------  
// BALANCE  
// --------------------------------------  

if (balance) {  

    balance.textContent =  
        formatNumber(  
            game.balance  
        );  

}  


// --------------------------------------  
// TOTAL MINED  
// --------------------------------------  

if (totalMined) {  

    totalMined.textContent =  
        formatNumber(  
            game.totalMined  
        );  

}  


// --------------------------------------  
// LEVEL  
// --------------------------------------  

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


// --------------------------------------  
// TAP POWER  
// --------------------------------------  

if (tapPower) {  

    tapPower.textContent =  
        game.tapPower;  

}  


// --------------------------------------  
// EFFECTIVE ENERGY  
// --------------------------------------  

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


// --------------------------------------  
// EFFECTIVE MINING RATE  
// --------------------------------------  

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


// --------------------------------------  
// ENERGY BAR  
// --------------------------------------  

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


// --------------------------------------  
// XP BAR  
// --------------------------------------  

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


// --------------------------------------  
// MISSION  
// --------------------------------------  

if (missionProgress) {  

    missionProgress.textContent =  

        Math.min(  
            game.missionProgress,  
            1000  
        ) +  
        " / 1000";  

}  


if (missionFill) {  

    const percent =  

        (  
            Math.min(  
                game.missionProgress,  
                1000  
            ) / 1000  
        ) * 100;  


    missionFill.style.width =  
        percent + "%";  

}  


// --------------------------------------  
// UPGRADE COSTS  
// --------------------------------------  

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


// --------------------------------------  
// REFERRAL  
// --------------------------------------  

const refCode =  
    document.getElementById(  
        "refCode"  
    );  


if (refCode) {  

    refCode.textContent =  
        getReferralCode();  

}  


const referralCount =  
    document.getElementById(  
        "referralCount"  
    );  


if (referralCount) {  

    referralCount.textContent =  
        game.referralCount;  

}  


const referralEarnings =  
    document.getElementById(  
        "referralEarnings"  
    );  


if (referralEarnings) {  

    referralEarnings.textContent =  
        formatNumber(  
            game.referralEarnings  
        );  

}  


// --------------------------------------  
// REFERRAL NAME  
// --------------------------------------  

const referralName =  
    document.getElementById(  
        "referralName"  
    );  


if (referralName) {  

    if (  
        game.pendingReferral &&  
        game.pendingReferral.invitedUser  
    ) {  

        referralName.textContent =  
            game.pendingReferral  
                .invitedUser  
                .displayName;  

    } else {  

        referralName.textContent =  
            "";  

    }  

}  


// ======================================  
// VIP UI  
// ======================================  

const vip =  
    getVIPData();  


const vipLevel =  
    document.getElementById(  
        "vipLevel"  
    );  


const vipLevelName =  
    document.getElementById(  
        "vipLevelName"  
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


if (vipLevelName) {  

    vipLevelName.textContent =  
        vip.name;  

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


// --------------------------------------  
// VIP DAILY BUTTON  
// --------------------------------------  

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


// --------------------------------------  
// VIP CARDS  
// --------------------------------------  

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
        VIP_LEVELS[levelNumber];  


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

return Math.floor(number)  
    .toLocaleString(  
        "en-US"  
    );

}

// ==========================================
// MINING RATE FORMAT
// ==========================================

function formatMiningRate(number) {

if (  
    Number.isInteger(number)  
) {  

    return String(number);  

}  


return number.toFixed(2);

}

// ==========================================
// LEVEL NAME
// ==========================================

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
    game.xp >=  
    required  
) {  

    game.xp -= required;  

    game.level++;  


    saveGame();  


    console.log(  
        "💾 Level saved:",  
        game.level  
    );  


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
    tg &&  
    tg.HapticFeedback  
) {  

    tg.HapticFeedback  
        .impactOccurred(  
            "light"  
        );  

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
// ENERGY REGENERATION
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
// TAP UPGRADE
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


showToast(  
    "⚡ Tap Power upgraded!"  
);  


saveGame();  

updateUI();

}

// ==========================================
// ENERGY UPGRADE
// ==========================================

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


const effectiveMaxEnergy =  
    getEffectiveMaxEnergy();  


game.energy =  
    effectiveMaxEnergy;  


game.energyLevel +=  
    1;  


showToast(  
    "🔋 Energy upgraded!"  
);  


saveGame();  

updateUI();

}

// ==========================================
// BOOST UPGRADE
// ==========================================

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


showToast(  
    "🚀 Mining Boost upgraded!"  
);  


saveGame();  

updateUI();

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


const referralCount =  
    document.getElementById(  
        "referralCount"  
    );  


if (referralCount) {  

    referralCount.textContent =  
        game.referralCount;  

}  


const referralEarnings =  
    document.getElementById(  
        "referralEarnings"  
    );  


if (referralEarnings) {  

    referralEarnings.textContent =  
        formatNumber(  
            game.referralEarnings  
        );  

}  


const referralName =  
    document.getElementById(  
        "referralName"  
    );  


if (referralName) {  

    if (  
        game.pendingReferral &&  
        game.pendingReferral.invitedUser  
    ) {  

        referralName.textContent =  
            game.pendingReferral  
                .invitedUser  
                .displayName;  

    } else {  

        referralName.textContent =  
            "";  

    }  

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
    tg &&  
    tg.openTelegramLink  
) {  

    tg.openTelegramLink(  
        shareUrl  
    );  

} else {  

    if (  
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


if (game.missionClaimed) {  

    showToast(  
        "✅ Mission already claimed"  
    );  

    return;  

}  


game.balance +=  
    100;  


game.missionClaimed =  
    true;  


showToast(  
    "🎁 +100 BSHIB Mission Reward"  
);  


saveGame();  

updateUI();

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
    "+" + amount;  


coin.style.left =  

    (  
        45 +  
        Math.random() * 10  
    ) + "%";  


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
// SHOP - ENERGY PACK
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

// ==========================================
// SHOP - MINING BOOST
// ==========================================

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


// --------------------------------------  
// START  
// --------------------------------------  

if (startButton) {  

    startButton.addEventListener(  
        "click",  
        startGame  
    );  

}  


// --------------------------------------  
// MINING  
// --------------------------------------  

if (mineButton) {  

    mineButton.addEventListener(  
        "click",  
        mine  
    );  

}  


// --------------------------------------  
// SOUND  
// --------------------------------------  

if (soundButton) {  

    soundButton.addEventListener(  
        "click",  
        toggleSound  
    );  

}  


// --------------------------------------  
// UPGRADES  
// --------------------------------------  

if (upgradeTapButton) {  

    upgradeTapButton.addEventListener(  
        "click",  
        upgradeTap  
    );  

}  


if (upgradeEnergyButton) {  

    upgradeEnergyButton.addEventListener(  
        "click",  
        upgradeEnergy  
    );  

}  


if (upgradeBoostButton) {  

    upgradeBoostButton.addEventListener(  
        "click",  
        upgradeBoost  
    );  

}  


// --------------------------------------  
// SHOP  
// --------------------------------------  

if (buyEnergyPackButton) {  

    buyEnergyPackButton.addEventListener(  
        "click",  
        buyEnergyPack  
    );  

}  


if (buyMiningBoostButton) {  

    buyMiningBoostButton.addEventListener(  
        "click",  
        buyMiningBoost  
    );  

}  


// --------------------------------------  
// REFERRAL  
// --------------------------------------  

if (copyRefButton) {  

    copyRefButton.addEventListener(  
        "click",  
        copyReferral  
    );  

}  


if (inviteButton) {  

    inviteButton.addEventListener(  
        "click",  
        inviteFriends  
    );  

}  


// --------------------------------------  
// MISSION  
// --------------------------------------  

if (claimMissionButton) {  

    claimMissionButton.addEventListener(  
        "click",  
        claimMission  
    );  

}  


// --------------------------------------  
// WALLET  
// --------------------------------------  

if (walletButton) {  

    walletButton.addEventListener(  
        "click",  
        connectWallet  
    );  

}  


// --------------------------------------  
// VIP DAILY  
// --------------------------------------  

if (claimVIPButton) {  

    claimVIPButton.addEventListener(  
        "click",  
        claimVIPDailyReward  
    );  

}  


// --------------------------------------  
// VIP BUY BUTTONS  
// --------------------------------------  

const vipBuyButtons =  
    document.querySelectorAll(  
        ".vip-buy-btn"  
    );  


vipBuyButtons.forEach(  
    button => {  

        button.addEventListener(  
            "click",  
            function() {  

                const level =  
                    Number(  
                        this.dataset.vipLevel  
                    );  

                buyVIP(level);  

            }  
        );  

    }  
);

}

// ==========================================
// INITIALIZE APP
// ==========================================

async function initApp() {

initTelegram();  

refreshUser();  


console.log(  
    "👤 Telegram ID before load:",  
    user.id  
);  


console.log(  
    "👤 Telegram username:",  
    user.username  
);  


await loadGameFromTelegram();  


refreshUser();  


// --------------------------------------  
// VIP DATA SAFETY  
// --------------------------------------  

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


// --------------------------------------  
// REFERRAL  
// --------------------------------------  

generateReferralCode();  

processReferral();  


// --------------------------------------  
// UI  
// --------------------------------------  

updatePlayerInfo();  

setupReferral();  

setupButtons();  

setupNavigation();  

updateUI();  


// --------------------------------------  
// FINAL LOGS  
// --------------------------------------  

console.log(  
    "🐕 Baby Shiba Inu App 2.5 Ready"  
);  


console.log(  
    "Telegram ID:",  
    user.id  
);  


console.log(  
    "Username:",  
    user.username  
);  


console.log(  
    "Display Name:",  
    getUserDisplayName(user)  
);  


console.log(  
    "Referral Code:",  
    getReferralCode()  
);  


console.log(  
    "Referral Link:",  
    getReferralLink()  
);  


console.log(  
    "VIP Level:",  
    game.vipLevel  
);  


console.log(  
    "VIP Data:",  
    getVIPData()  
);  


console.log(  
    "Pending Referral:",  
    game.pendingReferral  
);

}

// ==========================================
// START
// ==========================================

document.addEventListener(

"DOMContentLoaded",  

initApp

);

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
