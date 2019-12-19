import * as crypto from "crypto";

export namespace EncryptUtil {
    export function md5(source: string): string {
        return crypto.createHash("md5")
            .update(source)
            .digest("hex");
    }

    const AES_KEY = new Int8Array([ 107, -127, -3, -23, 35, 124, -118, -52, -100, 22, -68, -8, 32, 75, -31, 56 ]);
    const AES_algorithm = "aes-128-ecb";

    export function encryptAES(data: string) {
        const cipherChunks = [];
        const cipher = crypto.createCipheriv(AES_algorithm, AES_KEY, "");
        cipher.setAutoPadding(true);

        cipherChunks.push(cipher.update(data, "utf8", "hex"));
        cipherChunks.push(cipher.final("hex"));
        return cipherChunks.join("");
    }

    export function decryptAES(data: string) {
        const cipherChunks = [];
        const cipher = crypto.createDecipheriv(AES_algorithm, AES_KEY, "");
        cipher.setAutoPadding(true);

        cipherChunks.push(cipher.update(data, "hex", "utf8"));
        cipherChunks.push(cipher.final("utf8"));
        return cipherChunks.join("");
    }
}
