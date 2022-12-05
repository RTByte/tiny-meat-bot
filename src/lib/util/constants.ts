/**
 * Regex that can capture any Discord Snowflake ID
 * @raw `/^(?<id>\d{17,20})$/`
 * @remark Capture group 1 is the Snowflake. It is named `id`.
 */
 export const SnowflakeRegex = /(?<id>\d{17,20})/;

 export const LinkRegex = /https?:\/\//g;