/**
 * Regex that can capture the ID of any animated or non-animated custom Discord emoji
 * @raw `/(?:<(?<animated>a)?:(?<name>\w{2,32}):)?(?<id>\d{17,21})>?/g`
 * @remark Capture group 1 can be used to determine whether the emoji is animated or not. It is named `animated`.
 * @remark Capture group 2 is the name of the emoji as it is typed in a message. It is named `name`.
 * @remark Capture group 3 is the ID of the emoji. It is named `id`.
 */
 export const EmojiRegex = /(?:<(?<animated>a)?:(?<name>\w{2,32}):)?(?<id>\d{17,21})>?/g;

/**
 * Regex that can capture any Discord Snowflake ID
 * @raw `/^(?<id>\d{17,20})$/`
 * @remark Capture group 1 is the Snowflake. It is named `id`.
 */
 export const SnowflakeRegex = /(?<id>\d{17,20})/;