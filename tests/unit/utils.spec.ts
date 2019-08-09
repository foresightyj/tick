import { extractUrls } from "@/utils";

describe('utils', () => {
    it('extractUrl', () => {
        const text = "hello http://www.baidu.com/1.png world HTTPS://jiji.com/product/list?q=hello&page=10#pretty";
        const res = extractUrls(text);
        expect(res).toEqual(["http://www.baidu.com/1.png", "HTTPS://jiji.com/product/list?q=hello&page=10#pretty"])
    });

    it('extractUrl2', () => {
        const text = "[⚓ T17459 AdvancedSearch里面，url里面有高级搜索属性的时候，高级搜索就要打开，现在又坏了！](http://192.168.0.228/T17459)";
        const res = extractUrls(text);
        expect(res).toEqual(["http://192.168.0.228/T17459"])
    });
});
