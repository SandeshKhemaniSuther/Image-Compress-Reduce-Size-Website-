// Get DOM elements (ADD THE NEW qualitySection ELEMENT)
const imageUpload = document.getElementById('imageUpload');
const fileNameDisplay = document.getElementById('fileName');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const qualityRange = document.getElementById('qualityRange');
const qualityValueDisplay = document.getElementById('qualityValue');
const downloadButton = document.getElementById('downloadButton');
const downloadSection = document.getElementById('downloadSection');
const sizeInfo = document.getElementById('sizeInfo');
const resetButton = document.getElementById('resetButton');
const dropZone = document.getElementById('dropZone');
const qualitySection = document.getElementById('qualitySection'); // NEW ELEMENT REFERENCE

let originalFile = null;
let compressedBlob = null;
let originalSize = 0;
let fileName = '';

// --- HELPER FUNCTION TO PROCESS THE FILE (MODIFIED) ---
function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
        // Reset state for a fresh upload
        resetState(false); 

        originalFile = file;
        originalSize = file.size;
        fileName = file.name.split('.').slice(0, -1).join('.'); 
        fileNameDisplay.textContent = `File selected: ${file.name}`;
        
        resetButton.style.display = 'inline-block'; 
        
        // ** SHOW THE QUALITY SECTION HERE **
        qualitySection.style.display = 'block'; 
        
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage.src = e.target.result;
            compressAndDisplayImage(e.target.result, qualityRange.value / 100);
            downloadSection.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else if (file) {
        alert("Please upload a valid image file.");
        resetState();
    }
}

// --- DRAG AND DROP EVENT LISTENERS (KEPT THE SAME) ---

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('highlight'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('highlight'), false);
});

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length) {
        handleFile(files[0]);
    }
}


// --- EXISTING LISTENERS (KEPT THE SAME) ---

imageUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
});

resetButton.addEventListener('click', function() {
    resetState();
});

qualityRange.addEventListener('input', function() {
    const quality = this.value;
    qualityValueDisplay.textContent = `${quality}%`;
    if (originalFile) {
        compressAndDisplayImage(originalImage.src, quality / 100);
    }
});

// Main compression and display logic (kept the same)
function compressAndDisplayImage(imageUrl, quality) {
    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        compressedImage.src = compressedDataUrl;
        
        fetch(compressedDataUrl)
            .then(res => res.blob())
            .then(blob => {
                compressedBlob = blob;
                const compressedSize = blob.size;
                updateSizeInfo(originalSize, compressedSize);
            });
    };
    img.src = imageUrl;
}

// Update file size information (MODIFIED)
function updateSizeInfo(originalSize, compressedSize) {
    // 1. ORIGINAL SIZE (Always MB)
    const originalSizeMB = (originalSize / (1024 * 1024)).toFixed(2);

    // 2. COMPRESSED SIZE (Dynamic: KB or MB)
    let compressedSizeDisplay;
    
    // Check if compressed size is less than 1 MB (1024 * 1024 bytes)
    if (compressedSize < 1048576) {
        // Show in KB
        compressedSizeDisplay = (compressedSize / 1024).toFixed(0) + ' KB';
    } else {
        // Show in MB
        compressedSizeDisplay = (compressedSize / (1024 * 1024)).toFixed(2) + ' MB';
    }
    
    // 3. REDUCTION PERCENTAGE
    const reductionPercent = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);

    sizeInfo.innerHTML = `
        Original Size: <strong>${originalSizeMB} MB</strong> | 
        Compressed Size: <strong>${compressedSizeDisplay}</strong> | 
        Reduction: <strong>${reductionPercent}%</strong>
    `;
}


// Event listener for download button (kept the same)
downloadButton.addEventListener('click', function() {
    if (compressedBlob) {
        const a = document.createElement('a');
        const objectURL = URL.createObjectURL(compressedBlob);
        
        a.href = objectURL;
        const quality = qualityRange.value;
        a.download = `${fileName}-compressed-${quality}q.jpeg`; 
        
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(objectURL);
    } else {
        alert('Please upload and compress an image first.');
    }
});

// Reset state function (MODIFIED)
function resetState(clearInput = true) {
    originalFile = null;
    compressedBlob = null;
    originalSize = 0;
    fileName = '';
    
    if (clearInput) {
        imageUpload.value = ''; 
    }
    
    fileNameDisplay.textContent = 'No file selected.';
    originalImage.src = '';
    compressedImage.src = '';
    sizeInfo.textContent = '';
    downloadSection.style.display = 'none';
    
    // ** HIDE THE QUALITY SECTION ON RESET **
    qualitySection.style.display = 'none'; 
    
    // Reset quality range slider value visually
    qualityRange.value = 80;
    qualityValueDisplay.textContent = '80%';
    
    resetButton.style.display = 'none'; 
}

// Initialize on load
resetState();