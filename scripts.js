document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inputForm');
    const repeatTypeSelect = document.getElementById('repeat_type');
    const mainRepeatUnitLabel = document.getElementById('main_repeat_unit_label');

    // Form submit event
    form.addEventListener('submit', (event) => {
        // Add any JavaScript validation or processing here
        event.preventDefault();
        validateFasta();
        console.log('Form submitted');
    });

    function updateLabel() {
        if (repeatTypeSelect.value === 'vntr') {
            mainRepeatUnitLabel.textContent = 'Repeat Unit Pattern (Regex):';
        } else {
            mainRepeatUnitLabel.textContent = 'Main Repeat Unit:';
        }
    }

    updateLabel();

    // Change event for Repeat Type dropdown
    repeatTypeSelect.addEventListener('change', function() {
        if (this.value === 'vntr') {
            mainRepeatUnitLabel.textContent = 'Repeat Unit Pattern (Regex):';
        } else {
            mainRepeatUnitLabel.textContent = 'Main Repeat Unit:';
        }
    });
});

function validateFasta() {
    const fileInput = document.getElementById('repeat_seqs');
    const file = fileInput.files[0];

    // Define file size limit (e.g., 5MB)
    const MAX_SIZE_MB = 5;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    if (file) {
        if (file.size > MAX_SIZE_BYTES) {
            alert('File is too large. Please select a file smaller than 5MB.');
            return;
        }

        const reader = new FileReader();

        reader.onload = function(event) {
            const fileContent = event.target.result;
            const sequences = fileContent.split('>').slice(1);

            let output = '<h1>Processed Sequences</h1>';
            sequences.forEach(seq => {
                const [header, ...rest] = seq.split('\n');
                const sequence = rest.join('').replace(/\s+/g, '');
                output += `<p><strong>${header}</strong><br>${sequence}</p>`;
            });

            document.body.innerHTML += output;
        };

        reader.readAsText(file);
    } else {
        alert('Please upload a file.');
    }
}