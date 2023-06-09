class Stack {
    size;
    top;
    length;

    constructor(size = null) 
    {
        this.top = -1;
        this.size = size;
        this.length = 0;

        for(let i = 0; i < size; i++) {
            this[i] = null;
        }
    }

    push(value)
    {
        if(this.size !== null) {
            if(this.top === this.size - 1) throw new Error('Pilha cheia');
        }

        this.length++;
        this[++this.top] = value;
    }

    pop()
    {
        if(this.top === -1) throw new Error('Pilha vazia');

        let popped = this[this.top];

        delete this[this.top--];
        this.length--;

        return popped;
    }

    print()
    {
        let stack = [];

        for(let i = this.top; i >= 0; i--) {
            stack.push(this[i] || 'null');
        }

        console.log(`[ ${stack.join(' | ')} ]`);
    }
}