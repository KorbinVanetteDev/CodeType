export class TypingTest {
    constructor() {
        this.textarea = document.querySelector(".textarea");
        this.charCont = document.querySelector(".char-cont");
        this.cursor = document.querySelector(".cursor");
        this.blurDiv = document.querySelector(".blur-div");
        
        this.testText = "const hello = () => { console.log('world'); }";
        this.currentIndex = 0;
        this.started = false;
        this.startTime = null;
        this.endTime = null;
        this.mistakes = 0;
        
        this.init();
    }

    init() {
        this.renderText();
        this.textarea.addEventListener("input", (e) => this.handleInput(e));
        this.textarea.focus();
    }

    renderText() {
        this.charCont.innerHTML = "";
        
        for (let i = 0; i < this.testText.length; i++) {
            const span = document.createElement("span");
            span.className = "char";
            
            if (i < this.currentIndex) {
                if (this.getTypedChar(i) === this.testText[i]) {
                    span.classList.add("correct");
                } else {
                    span.classList.add("incorrect");
                    this.mistakes++;
                }
            } else if (i === this.currentIndex) {
                span.classList.add("current");
            }
            
            span.textContent = this.testText[i];
            this.charCont.appendChild(span);
        }
        
        this.updateCursor();
    }

    updateCursor() {
        const currentChar = this.charCont.querySelector(".char.current");
        if (currentChar) {
            const rect = currentChar.getBoundingClientRect();
            const cont = this.charCont.getBoundingClientRect();
            
            this.cursor.style.left = (rect.left - cont.left) + "px";
            this.cursor.style.top = (rect.top - cont.top) + "px";
        }
    }

    handleInput(e) {
        if (!this.started) {
            this.start();
        }

        const typed = this.textarea.value;
        
        if (typed.length > this.testText.length) {
            this.textarea.value = this.textarea.value.slice(0, -1);
            return;
        }

        this.currentIndex = typed.length;
        
        if (this.currentIndex === this.testText.length) {
            this.finish();
        }

        this.renderText();
    }

    start() {
        this.started = true;
        this.startTime = Date.now();
        this.blurDiv.style.display = "none";
    }

    finish() {
        this.endTime = Date.now();
        this.textarea.disabled = true;
        
        const duration = (this.endTime - this.startTime) / 1000 / 60; // minutes
        const wpm = (this.testText.length / 5 - this.mistakes) / duration;
        const acc = Math.floor((1 - this.mistakes / this.testText.length) * 100);
        
        this.submitResult({
            wpm: Math.round(wpm),
            acc,
            mistakes: this.mistakes,
            typed: this.testText.length
        });
    }

    getTypedChar(index) {
        return this.textarea.value[index] || "";
    }

    async submitResult(result) {
        try {
            const response = await fetch("/result", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...result,
                    wrong: result.mistakes,
                    start: new Date(this.startTime),
                    end: new Date(this.endTime)
                })
            });

            const data = await response.json();
            if (data.success) {
                console.log("Result saved! PB:", data.pb);
            }
        } catch (err) {
            console.error("Failed to submit result:", err);
        }
    }
}

export function initTypingTest() {
    new TypingTest();
}