import axios from 'axios';

class TranscribeApp {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.setupDragAndDrop();
    }

    initializeElements() {
        this.urlForm = document.getElementById('urlForm');
        this.fileForm = document.getElementById('fileForm');
        this.videoUrlInput = document.getElementById('videoUrl');
        this.audioFileInput = document.getElementById('audioFile');
        this.fileUploadArea = document.getElementById('fileUploadArea');
        this.transcribeBtn = document.getElementById('transcribeBtn');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.clearBtn = document.getElementById('clearBtn');
        
        this.loadingDiv = document.getElementById('loading');
        this.errorDiv = document.getElementById('error');
        this.successDiv = document.getElementById('success');
        this.resultsDiv = document.getElementById('results');
        this.summaryDiv = document.getElementById('summary');
        this.transcriptDiv = document.getElementById('transcript');
    }

    attachEventListeners() {
        if (this.urlForm) this.urlForm.addEventListener('submit', (e) => this.handleUrlSubmit(e));
        this.fileForm.addEventListener('submit', (e) => this.handleFileSubmit(e));
        this.clearBtn.addEventListener('click', () => this.clearResults());
        this.fileUploadArea.addEventListener('click', () => this.audioFileInput.click());
        this.audioFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    setupDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.fileUploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.fileUploadArea.addEventListener(eventName, () => {
                this.fileUploadArea.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.fileUploadArea.addEventListener(eventName, () => {
                this.fileUploadArea.classList.remove('drag-over');
            }, false);
        });

        this.fileUploadArea.addEventListener('drop', (e) => this.handleDrop(e), false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.audioFileInput.files = files;
            this.updateFileUploadText(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.updateFileUploadText(file);
        }
    }

    updateFileUploadText(file) {
        const uploadText = this.fileUploadArea.querySelector('div');
        uploadText.innerHTML = `
            <div>📁 Selected: ${file.name}</div>
            <div class="supported-formats">Size: ${this.formatFileSize(file.size)}</div>
        `;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async handleUrlSubmit(e) {
        e.preventDefault();
        const url = this.videoUrlInput?.value?.trim();
        if (!url) {
            this.showError('Please enter a valid URL');
            return;
        }

        await this.transcribeFromUrl(url);
    }

    async handleFileSubmit(e) {
        e.preventDefault();
        const file = this.audioFileInput.files[0];
        
        if (!file) {
            this.showError('Please select a file');
            return;
        }

        await this.transcribeFromFile(file);
    }

    async transcribeFromUrl(url) {
        this.showLoading();
        try {
            const response = await axios.post('/api/transcribe-url', { url });
            this.showResults(response.data);
            this.showSuccess(`Successfully transcribed from URL: ${url}`);
        } catch (error) {
            if (error.response?.data?.message) {
                this.showError(`${error.response.data.error}: ${error.response.data.message}`);
            } else {
                this.showError(error.response?.data?.error || 'Failed to transcribe from URL');
            }
        } finally {
            this.hideLoading();
        }
    }

    async transcribeFromFile(file) {
        this.showLoading();
        
        try {
            const formData = new FormData();
            formData.append('audio', file);
            
            const response = await axios.post('/api/transcribe-file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            this.showResults(response.data);
            this.showSuccess(`Successfully transcribed file: ${file.name}`);
        } catch (error) {
            this.showError(error.response?.data?.error || 'Failed to transcribe file');
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        this.loadingDiv.style.display = 'flex';
        this.transcribeBtn.disabled = true;
        this.uploadBtn.disabled = true;
        this.hideMessages();
    }

    hideLoading() {
        this.loadingDiv.style.display = 'none';
        this.transcribeBtn.disabled = false;
        this.uploadBtn.disabled = false;
    }

    showError(message) {
        this.errorDiv.textContent = message;
        this.errorDiv.style.display = 'block';
        this.successDiv.style.display = 'none';
    }

    showSuccess(message) {
        this.successDiv.textContent = message;
        this.successDiv.style.display = 'block';
        this.errorDiv.style.display = 'none';
    }

    hideMessages() {
        this.errorDiv.style.display = 'none';
        this.successDiv.style.display = 'none';
    }

    showResults(data) {
        this.summaryDiv.textContent = data.summary;
        this.transcriptDiv.textContent = data.transcript;
        this.resultsDiv.style.display = 'block';
        
        // Scroll to results
        setTimeout(() => {
            this.resultsDiv.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

    clearResults() {
        // Clear any inputs
        this.audioFileInput.value = '';
        this.resultsDiv.style.display = 'none';
        this.hideMessages();
        
        // Reset file upload area
        const uploadText = this.fileUploadArea.querySelector('div');
        uploadText.innerHTML = `
            📁 Click to select or drag & drop your file here
        `;
        
        // Add back the supported formats text
        const supportedFormats = this.fileUploadArea.querySelector('.supported-formats');
        if (!supportedFormats) {
            const formatsDiv = document.createElement('div');
            formatsDiv.className = 'supported-formats';
            formatsDiv.textContent = 'Supports: MP3, MP4, WAV, M4A, MOV, AVI (max 500MB)';
            this.fileUploadArea.appendChild(formatsDiv);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TranscribeApp();
});

// Health check on app start
axios.get('/api/health')
    .then(() => console.log('✅ Connected to backend'))
    .catch(() => console.warn('⚠️ Backend connection failed'));