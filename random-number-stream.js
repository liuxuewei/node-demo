const Readable = require('stream').Readable;

class RandomNumberStream extends Readable {
    constructor(max) {
        super()
        this.max = max;
        this.count = 1;
    }
    _read() {
        setTimeout(() => {
            if (this.max) {
                const randomNumber = parseInt(Math.random() * 10000);
                // 只能 push 字符串或 Buffer，为了方便显示打一个回车
                this.push(`${this.count}:${randomNumber}\n`);
                this.max--;
                this.count++;
            } else { // push null 可以让流停止
                this.push(null);
            }
        }, 100);
    }
}
module.exports = RandomNumberStream;