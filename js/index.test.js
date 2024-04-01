// Mock window so that the audio doesn't affect the test environment. 
global.window = {}; // Mock the window object
global.AudioContext = jest.fn().mockImplementation(() => ({
    createOscillator: jest.fn().mockReturnValue({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
    }),
    createGain: jest.fn().mockReturnValue({
        connect: jest.fn(),
        gain: { setValueAtTime: jest.fn() },
    }),
    currentTime: 0,
}));


const MorseCodeTranslator = require("./index");

describe("MorseCodeTranslator", () => {
    it("should translate English to Morse Code correctly", () => {
        expect(MorseCodeTranslator.translateToMorse("HELLO WORLD")).toBe(
            ".... . .-.. .-.. --- / .-- --- .-. .-.. -.."
        );
    });

    it("should translate Morse Code to English correctly", () => {
        expect(
            MorseCodeTranslator.translateToEnglish(
                ".... . .-.. .-.. --- / .-- --- .-. .-.. -.."
            )
        ).toBe("HELLO WORLD");
    });

    it("should handle empty string input", () => {
        expect(MorseCodeTranslator.translateToMorse("")).toBe("");
        expect(MorseCodeTranslator.translateToEnglish("")).toBe("");
    });

    it("should handle sentences (input with spaces)", () => {
        expect(MorseCodeTranslator.translateToMorse("What's going on?")).toBe(
            ".-- .... .- - .----. ... / --. --- .. -. --. / --- -. ..--.."
        );
        expect(
            MorseCodeTranslator.translateToEnglish(
                ".-- .... .- - .----. ... / --. --- .. -. --. / --- -. ..--.."
            )
        ).toBe("WHAT'S GOING ON?");
    });

    it("should handle single words", () => {
        expect(MorseCodeTranslator.translateToMorse("onomatopoeia")).toBe(
            "--- -. --- -- .- - --- .--. --- . .. .-"
        );
    });

    it("should handle sentences without spaces in English (continuous input)", () => {
        expect(MorseCodeTranslator.translateToMorse("HELLOWORLD")).toBe(
            ".... . .-.. .-.. --- .-- --- .-. .-.. -.."
        );
    });

    it("should manage long strings (100 words with spaces and punctuation)", () => {
        const longString = "Hey! ".repeat(100);
        // Ensure there's no extra space before each slash in the expected Morse code
        const expectedMorse = ".... . -.-- -.-.-- / ".repeat(100);
        expect(MorseCodeTranslator.translateToMorse(longString)).toBe(
            expectedMorse
        );
    });

    it("should translate repeating characters correctly", () => {
        expect(MorseCodeTranslator.translateToMorse("AAA")).toBe(".- .- .-");
        expect(MorseCodeTranslator.translateToEnglish(".- .- .-")).toBe("AAA");
    });

    it("should handle numbers correctly", () => {
        expect(MorseCodeTranslator.translateToMorse("12345")).toBe(
            ".---- ..--- ...-- ....- ....."
        );
    });

    it("should handle a mix of numbers, letters and punctionation", () => {
        expect(
            MorseCodeTranslator.translateToMorse(
                "That's Tim's 267th coffee today!"
            )
        ).toBe(
            "- .... .- - .----. ... / - .. -- .----. ... / ..--- -.... --... - .... / -.-. --- ..-. ..-. . . / - --- -.. .- -.-- -.-.--"
        );
    });

    it("should handle unknown characters", () => {
        expect(MorseCodeTranslator.translateToMorse("*")).toBe("");
    });
});
