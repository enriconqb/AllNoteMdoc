document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const message = document.getElementById('message');
    const uploadBtn = document.getElementById('upload-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    // Allowed file types
    const allowedTypes = ['.xls', '.xlsx'];

    // Drag and Drop Events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when dragging over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);

    // Handle file input change
    fileInput.addEventListener('change', handleFileSelect);

    // Handle upload button click
    uploadBtn.addEventListener('click', handleUpload);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropZone.classList.add('dragover');
    }

    function unhighlight() {
        dropZone.classList.remove('dragover');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

            if (allowedTypes.includes(fileExtension)) {
                showFileInfo(file);
                showMessage('File selected successfully!', 'success');
                uploadBtn.classList.remove('d-none');
            } else {
                showMessage('Please select an Excel file (.xls or .xlsx)', 'danger');
                resetFileInfo();
            }
        }
    }

    function showFileInfo(file) {
        fileName.textContent = file.name;
        fileInfo.classList.remove('d-none');
    }

    function resetFileInfo() {
        fileInfo.classList.add('d-none');
        fileName.textContent = '';
        uploadBtn.classList.add('d-none');
        fileInput.value = '';
    }

    function showMessage(text, type) {
        message.textContent = text;
        message.classList.remove('d-none');
        
        // Remove all alert classes
        message.className = 'alert';
        
        // Add appropriate Bootstrap alert class
        message.classList.add(`alert-${type}`);
    }

    function handleUpload() {
        // Disable upload button
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Uploading...';
        
        // Show progress container
        progressContainer.classList.remove('d-none');
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            updateProgress(progress);
            
            if (progress >= 100) {
                clearInterval(interval);
                uploadComplete();
            }
        }, 500);
    }

    function updateProgress(value) {
        progressBar.style.width = `${value}%`;
        progressBar.setAttribute('aria-valuenow', value);
        progressText.textContent = `${value}%`;
    }

    function uploadComplete() {
        showMessage('File uploaded successfully!', 'success');
        uploadBtn.innerHTML = 'Upload File';
        
        setTimeout(() => {
            // Reset everything
            resetFileInfo();
            progressContainer.classList.add('d-none');
            progressBar.style.width = '0%';
            progressBar.setAttribute('aria-valuenow', 0);
            progressText.textContent = '0%';
            uploadBtn.disabled = false;
        }, 2000);
    }
});
