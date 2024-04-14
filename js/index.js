const MorseCodeTranslator = {
    // Add more characters to the dictionary as needed - mainly punctuation marks and numbers.
    morseCodeDict: {
        A: ".-",
        B: "-...",
        C: "-.-.",
        D: "-..",
        E: ".",
        F: "..-.",
        G: "--.",
        H: "....",
        I: "..",
        J: ".---",
        K: "-.-",
        L: ".-..",
        M: "--",
        N: "-.",
        O: "---",
        P: ".--.",
        Q: "--.-",
        R: ".-.",
        S: "...",
        T: "-",
        U: "..-",
        V: "...-",
        W: ".--",
        X: "-..-",
        Y: "-.--",
        Z: "--..",
        0: "-----",
        1: ".----",
        2: "..---",
        3: "...--",
        4: "....-",
        5: ".....",
        6: "-....",
        7: "--...",
        8: "---..",
        9: "----.",
        ".": ".-.-.-",
        ",": "--..--",
        "?": "..--..",
        "'": ".----.",
        "!": "-.-.--",
        "/": "-..-.",
        "(": "-.--.",
        ")": "-.--.-",
        "&": ".-...",
        ":": "---...",
        ";": "-.-.-.",
        "=": "-...-",
        "+": ".-.-.",
        "-": "-....-",
        _: "..--.-",
        '"': ".-..-.",
        $: "...-..-",
        "@": ".--.-.",
        "%": "-..-.",
        " ": "   ",
    },

    // Apparently needed for browser compatibility
    audioContext: new (window.AudioContext || window.webkitAudioContext)(),
    // Flag to check if Morse code is currently playing
    isPlaying: false,
    // The Morse code that is currently playing
    currentMorseCode: "",
    // Position in the Morse code string where playback stopped
    playbackPosition: 0,

    translateToMorse: function (text) {
        // Split the text into words by spaces
        const words = text.toUpperCase().split(" ");

        // Convert each word to Morse code, joining characters with spaces
        const morseWords = words.map((word) =>
            word
                .split("")
                // map each character to its Morse code equivalent or "" if not found
                .map((character) => this.morseCodeDict[character] || "")
                .join(" ")
        );

        // Join the Morse code words with " / " to separate them
        return morseWords.join(" / ");
    },

    translateToEnglish: function (morse) {
        // Practise huge chaining (good practise or not?)
        // Mainly the .map in the middle
        return (
            morse
                // Split the Morse code into words by three spaces
                .split(" / ")
                // Convert each Morse word to English, joining characters with spaces
                .map((morseWord) =>
                    morseWord
                        // Split the Morse word into characters by spaces
                        .split(" ")
                        // map each Morse character to its English equivalent or "" if not found
                        .map(
                            (morseChar) =>
                                // Find the English character for the Morse code
                                // .find() will return the first match or undefined if not found
                                Object.keys(this.morseCodeDict).find(
                                    (key) =>
                                        this.morseCodeDict[key] === morseChar
                                ) || ""
                        )
                        // Join the English characters to form a word
                        .join("")
                )
                // Join the English words with spaces
                .join(" ")
        );
    },

    determineTranslationDirection: function (text) {
        // Check if the text is likely Morse code
        // Morse code is considered if the text only contains Morse code characters (dot, dash, space)
        // and has a structure that includes Morse character sequences separated by spaces or slashes
        const isMorseCode =
            text.trim().length > 0 &&
            /^[.\- \/]+$/.test(text) &&
            /(\.-|-\.|\/)/.test(text);

        if (isMorseCode) {
            return this.translateToEnglish(text);
        } else {
            return this.translateToMorse(text);
        }
    },

    playMorseCode: function (morseCode) {
        if (!this.isPlaying) {
            // Check if new Morse code is different from the current, then reset (=0) playback position
            if (this.currentMorseCode !== morseCode) {
                this.currentMorseCode = morseCode;
                this.playbackPosition = 0;
            }
            this.isPlaying = true;
        }

        /// Taken from https://codepen.io/cople/pen/zZLJOz ///

        const dot = 1.2 / 15;
        let t = this.audioContext.currentTime;

        const oscillator = this.audioContext.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.value = 600;

        const gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.setValueAtTime(0, t);

        // Start playing the Morse code
        let i = this.playbackPosition;
        // Recursive function to play the Morse code
        const playNext = () => {
            // Stop playing if the playback was stopped or reached the end of the Morse code
            if (!this.isPlaying || i >= this.currentMorseCode.length) {
                this.isPlaying = false;
                // Reset the playback position if the Morse code has finished playing
                if (i >= this.currentMorseCode.length) {
                    this.playbackPosition = 0;
                }
                // Stop the oscillator and return
                oscillator.stop();
                return;
            }

            const letter = this.currentMorseCode[i++];
            switch (letter) {
                case ".":
                    gainNode.gain.setValueAtTime(1, t);
                    t += dot;
                    gainNode.gain.setValueAtTime(0, t);
                    t += dot;
                    break;
                case "-":
                    gainNode.gain.setValueAtTime(1, t);
                    t += 3 * dot;
                    gainNode.gain.setValueAtTime(0, t);
                    t += dot;
                    break;
                case " ":
                    t += 7 * dot;
                    break;
            }

            // Queue the next play after the current sound finishes
            this.audioContext.resume().then(() => {
                setTimeout(
                    playNext,
                    t * 1000 - this.audioContext.currentTime * 1000
                );
            });
        };

        playNext();

        oscillator.start();
        this.playbackPosition = i;
    },

    // Stop playing the Morse code
    stopMorseCode: function () {
        // Set the flag to stop playing and close the audio context
        if (this.isPlaying) {
            this.isPlaying = false;
            this.audioContext.close();
            this.audioContext = new (window.AudioContext ||
                window.webkitAudioContext)();
        }
    },

    // Attach event listeners to the buttons
    attachEventListeners: function () {
        // Swap the text in the input fields when the button is clicked
        document
            .querySelector(".translator__container__button--swap")
            .addEventListener("click", () => {
                const textA = document.querySelector(
                    ".translator__container__text--A"
                ).value;
                const textB = document.querySelector(
                    ".translator__container__text--B"
                ).value;
                document.querySelector(
                    ".translator__container__text--A"
                ).value = textB;
                document.querySelector(
                    ".translator__container__text--B"
                ).value = textA;
                if (textA.trim() !== "") {
                    this.togglePlayStopButtons(textA);
                }
                // Stop playing Morse code when swapping
                this.stopMorseCode();
            });

        // Translate the text when the button is clicked
        document
            .querySelector(".translator__container__button--translate")
            .addEventListener("click", () => {
                const containerA = document.querySelector(
                    ".translator__container__text--A"
                );
                const inputTextA = document.querySelector(
                    ".translator__container__text--A"
                ).value;
                const containerB = document.querySelector(
                    ".translator__container__text--B"
                );
                const inputTextB = document.querySelector(
                    ".translator__container__text--B"
                ).value;
                // Check if the input is empty
                if (!inputTextA.trim()) {
                    containerA.value =
                        "You haven't entered anything! Write either morse code or English here! Or, translate this!";
                    return;
                }
                // Check if the input text contains characters not present in the morseCodeDict
                const containsInvalidCharacters = inputTextA
                    .split("")
                    .some((character) => {
                        // Check both uppercase and lowercase to cover all cases
                        return (
                            !this.morseCodeDict[character.toUpperCase()] &&
                            !this.morseCodeDict[character.toLowerCase()]
                        );
                    });

                    // If the input contains invalid characters, show an error message  
                if (containsInvalidCharacters) {
                    containerB.value =
                        "The input contained characters not present in our Morse code dictionary! Please try again!";
                    return;
                }
                // Determine the translation direction and set the output
                const output = this.determineTranslationDirection(inputTextA);
                document.querySelector(
                    ".translator__container__text--B"
                ).value = output;
                this.togglePlayStopButtons(output);
                this.stopMorseCode();
            });

        // Play the Morse code when the button is clicked
        document
            .querySelector(".translator__container__button--play")
            .addEventListener("click", () => {
                const morseCode = document.querySelector(
                    ".translator__container__text--B"
                ).value;
                this.playMorseCode(morseCode);
            });

        // Stop playing the Morse code when the button is clicked
        document
            .querySelector(".translator__container__button--stop")
            .addEventListener("click", () => {
                this.stopMorseCode();
            });
    },

    // Toggle the visibility of the play and stop buttons based on the input text
    togglePlayStopButtons: function (text) {
        const playButton = document.querySelector(
            ".translator__container__button--play"
        );
        const stopButton = document.querySelector(
            ".translator__container__button--stop"
        );

        // If not alphanumeric or empty, show the play and stop buttons
        const isMorse = !/[A-Za-z0-9]/.test(text) || text.trim() == "";
        playButton.style.display = isMorse ? "block" : "none";
        stopButton.style.display = isMorse ? "block" : "none";
    },
};

// Initialize the translator and attach event listeners when the document is loaded
document.addEventListener("DOMContentLoaded", () =>
    MorseCodeTranslator.attachEventListeners()
);

module.exports = MorseCodeTranslator;
