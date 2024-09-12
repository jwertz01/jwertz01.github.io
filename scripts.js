document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inputForm');
    const repeatTypeSelect = document.getElementById('repeat_type');
    const mainRepeatUnitLabel = document.getElementById('main_repeat_unit_label');

    // Update label based on Repeat Type dropdown selection
    function updateLabel() {
        if (repeatTypeSelect.value === 'vntr') {
            mainRepeatUnitLabel.textContent = 'Repeat Unit Pattern (Regex):';
        } else {
            mainRepeatUnitLabel.textContent = 'Main Repeat Unit:';
        }
    }

    // Handle form submission
    function handleFormSubmit(event) {
        event.preventDefault(); // Prevent the default form submission

        if (validateFasta()) {
            processFasta();
        }
    }

    // Validate the file
    function validateFasta() {
        const fileInput = document.getElementById('repeat_seqs');
        const file = fileInput.files[0];
        const MAX_SIZE_MB = 5;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

        if (!file) {
            alert('Please upload a file.');
            return false;
        }

        if (file.size > MAX_SIZE_BYTES) {
            alert('File is too large. Please select a file smaller than 5MB.');
            return false;
        }

        return true;
    }

    // Process the FASTA file and update the page content
    function processFasta() {
        const geneName = document.getElementById('gene_name').value;
        const repeatType = document.getElementById('repeat_type').value;
        const mainRepeatUnit = document.getElementById('main_repeat_unit').value;

        const fileInput = document.getElementById('repeat_seqs');
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            const fileContent = event.target.result;
            const sequences = fileContent.split('>').slice(1);

            let htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Processed Results</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #333; }
                        p { margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <h1>${geneName}</h1>
                    <h2>${repeatType}</h2>
                    <h3>${mainRepeatUnit}</h3>
                    <section>
            `;

            sequences.forEach(seq => {
                const [header, ...rest] = seq.split('\n');
                const sequence = rest.join('').replace(/\s+/g, '');
                const trimmedSeq = trimToRepeat(sequence, mainRepeatUnit);

                htmlContent += `
                    <p><strong>${header}</strong><br>${sequence.replaceAll(mainRepeatUnit, "●")}<br>${trimmedSeq.replaceAll(mainRepeatUnit, "●")}</p>
                `;
            });

            htmlContent += `
                    </section>
                </body>
                </html>
            `;

            // Replace the current page content with the generated HTML
            document.open();
            document.write(htmlContent);
            document.close();
        };

        reader.readAsText(file);
    }

    function trimToRepeat(sequence, mainRepeatUnit) {
        const unitLength = mainRepeatUnit.length;
        const parsedSeq = sequence.replaceAll(mainRepeatUnit, "*");
        let repeatStart = -1;
        let repeatEnd = -1;
        let maxScore = -1;
        // calc repeat density as bases that are part of repeat / total bases using sliding window
        for (let i = 0; i < parsedSeq.length; i++) {  // start pos
            let repeatBp = 0;
            let windowBp = 0;
            for (let j = i; j < parsedSeq.length; j++) {  // end pos
                if (parsedSeq[j] === "*") {
                    repeatBp += unitLength;
                    windowBp += unitLength;
                } else { windowBp++; }
                if (windowBp === 0) continue;
                const score = repeatBp / windowBp;
                // Longest substring with repeat density >= .8. break ties by score
                if (score >= 0.8 && (
                    (j - i > repeatEnd - repeatStart) ||
                    (j - i === repeatEnd - repeatStart && score > maxScore)
                )) {
                    maxScore = score;
                    repeatStart = i;
                    repeatEnd = j;
                }
            }
        }
        // start and end on repeat
        while (parsedSeq[repeatStart] != "*") { repeatStart++; }
        while(parsedSeq[repeatEnd] != "*") { repeatEnd--; }
        // add 5bp flanking
        repeatStart = Math.max(0, repeatStart - 5);
        repeatEnd = Math.min(parsedSeq.length, repeatEnd + 5);
        // Return trimmed sequence
        return parsedSeq.substring(repeatStart, repeatEnd + 1).replaceAll("*", mainRepeatUnit);
    }
    // Attach event listeners
    form.addEventListener('submit', handleFormSubmit);
    repeatTypeSelect.addEventListener('change', updateLabel);

    // Initial label update
    updateLabel();
});