"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function greeter(person) {
    return "hello" + person.firstName + "-" + person.lastName;
}
exports.default = greeter;
//配置好tsconfig.json在根目录运行tsc，编译所有文件
//tsc --watch/w 实时监控ts变化并编译
//# sourceMappingURL=person.js.map