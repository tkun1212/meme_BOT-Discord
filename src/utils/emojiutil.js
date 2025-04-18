const emojis = require('../data/emojis.json');

// 絵文字名 → ID, ID → 絵文字名 の双方向マップを構築
const nameToId = new Map(Object.entries(emojis));
const idToName = new Map(Object.entries(emojis).map(([name, id]) => [id, name]));

/**
 * 名前から絵文字IDを取得します。
 * @param {string} name - 絵文字の名前
 * @return {string|null}
 */
function getEmojiId(name) {
    if (typeof name !== 'string') return null;
    return nameToId.get(name) || null;
}

/**
 * 絵文字IDから名前を取得します。
 * @param {string} id - 絵文字のID
 * @return {string|null}
 */
function getEmojiName(id) {
    if (typeof id !== 'string') return null;
    return idToName.get(id) || null;
}

/**
 * 名前からDiscordで使える形式の絵文字を取得します。
 * @param {string} name - 絵文字の名前
 * @return {string|null}
 */
function getEmojiFromName(name) {
    const id = getEmojiId(name);
    return id ? `<:${name}:${id}>` : null;
}

/**
 * 絵文字IDからDiscordで使える形式の絵文字を取得します。
 * @param {string} id - 絵文字のID
 * @return {string|null}
 */
function getEmojiFromId(id) {
    const name = getEmojiName(id);
    return name ? `<:${name}:${id}>` : null;
}

module.exports = {
    getEmojiId,
    getEmojiName,
    getEmojiFromName,
    getEmojiFromId
};
