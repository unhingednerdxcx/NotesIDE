// Minimal ANSI Parser → produces operations:
// {type: "text", value: "..."} or {type: "cursor", row, col} etc.

window.parseANSI = function(input) {
    let ops = [];
    let i = 0;

    while (i < input.length) {
        if (input[i] === "\x1b" && input[i + 1] === "[") {
            // CSI sequence
            let seq = "";
            i += 2;

            while (i < input.length && !/[A-Za-z]/.test(input[i])) {
                seq += input[i++];
            }

            let cmd = input[i++];
            let nums = seq.split(";").map(x => parseInt(x || 0));

            if (cmd === "H" || cmd === "f") {
                ops.push({ type: "cursor", row: nums[0], col: nums[1] });
            }
            else if (cmd === "J") {
                ops.push({ type: "clear" });
            }
            else if (cmd === "m") {
                ops.push({ type: "style", nums });
            }

        } else {
            // Normal text
            ops.push({ type: "text", value: input[i] });
            i++;
        }
    }

    return ops;
}
