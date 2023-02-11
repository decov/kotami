// consts
const { COLORS } = require('@src/data.json');
const { readdirSync, lstatSync } = require('fs');
const { join, extname } = require('path');

const permissions = require('./permissions');

module.exports = class Utils {
    /**
     * checando se a string contém algum URL
     * @param {string} text
     */
    static containsLink(text) {
        return /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/.test(
            text
        );
    }

    /**
     * checando se a string contém algum invite do discord
     * @param {string} text
     */
    static containsDiscordInvite(text) {
        return /(https?:\/\/)?(www.)?(discord.(gg|io|me|li|link|plus)|discorda?p?p?.com\/invite|invite.gg|dsc.gg|urlcord.cf)\/[^\s/]+?(?=\b)/.test(
            text
        );
    }

    /**
     * retorna um número aleatório abaixo de um máximo
     * @param {number} max
     */
    static getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    /**
     * checa se a string é uma cor hex válida
     * @param {string} text
     */
    static isHex(text) {
        return /^#[0-9A-F]{6}$/i.test(text);
    }

    /**
     * @param {string} text
     */
    static isValidColor(text) {
        if (COLORS.indexOf(text) > -1) {
            return true;
        } else return false;
    }

    /**
     * retorna a diferença de horas entre dois horários
     * @param {Date} dt2
     * @param {Date} dt1
     */
    static diffHours(dt2, dt1) {
        let diff = (dt2.getTime() - dt1.getTime()) / 1000;

        diff /= 60 * 60;

        return Math.abs(Math.round(diff));
    }

    /**
     * retorna o tempo restante em dias, horas, minutos e segundos
     * @param {number} timeInSeconds
     */
    static timeformat(timeInSeconds) {
        const days = Math.floor((timeInSeconds % 31536000) / 86400); // dias
        const hours = Math.floor((timeInSeconds % 86400) / 3600); // horas
        const minutes = Math.floor((timeInSeconds % 3600) / 60); // minutos
        const seconds = Math.floor(timeInSeconds % 60); // segundos

        return (
            (days > 0 ? `${days} dias, ` : "") +
            (hours > 0 ? `${hours} hours, ` : "") +
            (minutes > 0 ? `${minutes} minutes, ` : "") +
            (seconds > 0 ? `${seconds} seconds` : "")
        );
    }

    /**
     * converte a duração para milisegundos
     * @param {string} duration
     */
    static durationToMillis(duration) {
        return (
            duration
                .split(":")
                .map(Number)
                .reduce((acc, curr) => curr + acc * 60) * 1000
        );
    }

    /**
     * retorna o tempo restante até a data fornecida
     * @param {Date} timeUntil
     */
    static getRemainingTime(timeUntil) {
        const seconds = Math.abs((timeUntil - new Date()) / 1000);
        const time = Utils.timeformat(seconds);

        return time;
    }

    /**
     * @param {import('discord.js').PermissionResolvable[]} perms
     */
    static parsePermissions(perms) {
        const permissionWord = `permissions${perms.length > 1 ? 's' : ''}`;

        return '`' + perms.map((perm) => permissions[perm]).join(", ") + "` " + permissionWord;
    }

    /**
     * pesquisa por um arquivo em um diretório
     * @param {string} dir
     * @param {string[]} allowedExtensions
     */
    static recursiveReadDirSync(dir, allowedExtensions = [".js"]) {
        const filePaths = [];

        const readCommands = (dir) => {
            const files = readdirSync(join(process.cwd(), dir));

            files.forEach((file) => {
                const stat = lstatSync(join(process.cwd(), dir, file));

                if (stat.isDirectory()) {
                    readCommands(join(dir, file));
                } else {
                    const extension = extname(file);

                    if (!allowedExtensions.includes(extension))
                        return;

                    const filePath = join(process.cwd(), dir, file);

                    filePath.push(filePath);
                }
            });
        };

        readCommands(dir);

        return filePaths;
    }
};