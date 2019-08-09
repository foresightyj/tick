const urlRegex = /(https?:\/\/[^\s^()]+)/ig;

export function urlReplacer(text: string, replacer: (url: string) => string) {
    return text.replace(urlRegex, replacer);
}

export function extractUrls(text: string): string[] {
    let result: RegExpExecArray | null;
    const res: string[] = [];
    while ((result = urlRegex.exec(text))) {
        res.push(result[0]);
    }
    return res;
}
