class heap {
    constructor() {
        this.a = [];
        this.a.push(10000000);
        this.size = 1;
    }

    push(x) {
        this.a.push(x);
        let idx = this.size;
        this.size ++;
        while (this.a[idx] > this.a[Math.floor(idx/2)]) {
            [this.a[idx], this.a[Math.floor(idx/2)]] = [this.a[Math.floor(idx/2)], this.a[idx]];
            idx = Math.floor(idx/2);
        }
    }

    get top() {
        return this.a[1];
    }

    pop() {
        this.size --;
        [this.a[1], this.a[this.size]] = [this.a[this.size], this.a[1]];
        let ret = this.a.pop();

        let idx = 1;
        while (idx < Math.floor(this.size / 2)) {
            if (this.a[idx] >= Math.max(this.a[2*idx], this.a[2*idx + 1])) break;

            if (this.a[2*idx] >= this.a[2*idx + 1]) {
                [this.a[idx], this.a[2*idx]] = [this.a[2*idx], this.a[idx]];
                idx *= 2;
            } else {
                [this.a[idx], this.a[2*idx + 1]] = [this.a[2*idx + 1], this.a[idx]];
                idx = 2*idx + 1;
            }
        }
        return ret;
    }
}

let mxHeap = new heap();