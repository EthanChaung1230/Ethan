// 背單字系統 - JavaScript 主邏輯

class VocabularySystem {
    constructor() {
        this.words = [];
        this.currentIndex = 0;
        this.filterType = 'all';
        this.startTime = null;
        this.sessionStartTime = Date.now();
        this.dailyStats = {};
        this.currentView = 'dashboard';

        this.initializeData();
        this.setupEventListeners();
        this.updateDashboard();
    }

    // ========== 初始化 ==========
    initializeData() {
        const savedData = localStorage.getItem('vocabulary_system');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.words = data.words || [];
            this.dailyStats = data.dailyStats || {};
            // 添加預設單字
            this.words = this.addDefaultWords();
        } else {
            this.words = this.addDefaultWords();
            this.saveData();
        }
    }

    addDefaultWords() {
        const defaultWords = [
            {
                id: 1,
                english: 'Apple',
                meaning: '蘋果',
                pronunciation: '/ˈæpl/',
                example: 'An apple a day keeps the doctor away.',
                exampleZh: '一天一蘋果，醫生遠離我。',
                category: '日常用語',
                difficulty: 'easy',
                status: 'new',
                lastReview: null,
                reviewCount: 0,
                createdAt: Date.now()
            },
            {
                id: 2,
                english: 'Dictionary',
                meaning: '字典',
                pronunciation: '/ˈdɪkʃəneri/',
                example: 'I looked up the word in the dictionary.',
                exampleZh: '我在字典中查閱了這個單詞。',
                category: '教育',
                difficulty: 'medium',
                status: 'new',
                lastReview: null,
                reviewCount: 0,
                createdAt: Date.now()
            },
            {
                id: 3,
                english: 'Eloquent',
                meaning: '雄辯的，富有表現力的',
                pronunciation: '/ˈɛləkwənt/',
                example: 'She gave an eloquent speech at the conference.',
                exampleZh: '她在會議上發表了一場雄辯的演講。',
                category: '形容詞',
                difficulty: 'hard',
                status: 'new',
                lastReview: null,
                reviewCount: 0,
                createdAt: Date.now()
            },
            {
                id: 4,
                english: 'Book',
                meaning: '書籍',
                pronunciation: '/bʊk/',
                example: 'I read a book every day.',
                exampleZh: '我每天都讀一本書。',
                category: '日常用語',
                difficulty: 'easy',
                status: 'new',
                lastReview: null,
                reviewCount: 0,
                createdAt: Date.now()
            },
            {
                id: 5,
                english: 'Serendipity',
                meaning: '巧合，幸運',
                pronunciation: '/ˌsɛrənˈdɪpɪti/',
                example: 'We met by pure serendipity at the coffee shop.',
                exampleZh: '我們在咖啡館純粹是巧合相遇。',
                category: '高級詞彙',
                difficulty: 'hard',
                status: 'new',
                lastReview: null,
                reviewCount: 0,
                createdAt: Date.now()
            }
        ];

        // 只添加不存在的預設單字
        const existingIds = new Set(this.words.map(w => w.id));
        const newWords = defaultWords.filter(w => !existingIds.has(w.id));
        return [...this.words, ...newWords];
    }

    setupEventListeners() {
        // 導航
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });

        // 儀表板按鈕
        document.getElementById('start-learning-btn')?.addEventListener('click', () => this.switchView('learning'));
        document.getElementById('quick-review-btn')?.addEventListener('click', () => this.startQuickReview());
        document.getElementById('export-btn')?.addEventListener('click', () => this.exportData());
        document.getElementById('import-btn')?.addEventListener('click', () => this.importData());

        // 學習頁面
        document.getElementById('word-card')?.addEventListener('click', () => this.toggleCardFlip());
        document.getElementById('next-btn')?.addEventListener('click', () => this.nextWord());
        document.getElementById('prev-btn')?.addEventListener('click', () => this.previousWord());
        document.getElementById('mark-learned-btn')?.addEventListener('click', () => this.markAsLearned());
        document.getElementById('pronounce-btn')?.addEventListener('click', () => this.pronounceWord());

        // 過濾按鈕
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterWords(e.target.dataset.filter));
        });

        // 新增單字
        document.getElementById('add-word-btn')?.addEventListener('click', () => this.addWord());
        document.getElementById('clear-form-btn')?.addEventListener('click', () => this.clearForm());
        document.getElementById('batch-add-btn')?.addEventListener('click', () => this.toggleBatchSection());
        document.getElementById('submit-batch-btn')?.addEventListener('click', () => this.submitBatchWords());
        document.getElementById('cancel-batch-btn')?.addEventListener('click', () => this.toggleBatchSection());
        document.getElementById('search-words')?.addEventListener('input', (e) => this.searchWords(e.target.value));

        // 統計
        document.getElementById('reset-stats-btn')?.addEventListener('click', () => this.resetStats());
        document.getElementById('export-stats-btn')?.addEventListener('click', () => this.exportStats());

        // 表單驗證
        document.getElementById('word-input')?.addEventListener('input', () => this.validateForm());
        document.getElementById('meaning-input')?.addEventListener('input', () => this.validateForm());

        // 模態框
        document.getElementById('modal-confirm')?.addEventListener('click', () => this.handleModalConfirm());
        document.getElementById('modal-cancel')?.addEventListener('click', () => this.closeModal());

        // 檔案輸入
        document.getElementById('file-input')?.addEventListener('change', (e) => this.handleFileImport(e));
    }

    // ========== 檢視管理 ==========
    switchView(viewName) {
        this.currentView = viewName;
        
        // 更新導航狀態
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // 隱藏所有檢視
        document.querySelectorAll('.view').forEach(view => {
            view.classList.add('hidden');
        });

        // 顯示選中的檢視
        const viewElement = document.getElementById(`${viewName}-view`);
        if (viewElement) {
            viewElement.classList.remove('hidden');
        }

        // 檢視特定初始化
        if (viewName === 'learning') {
            this.initializeLearning();
        } else if (viewName === 'add-words') {
            this.displayWords();
        } else if (viewName === 'statistics') {
            this.updateStatistics();
        }
    }

    // ========== 儀表板 ==========
    updateDashboard() {
        const total = this.words.length;
        const learned = this.words.filter(w => w.status === 'learned').length;
        const learning = this.words.filter(w => w.status === 'learning').length;
        const review = this.words.filter(w => w.status === 'review').length;

        document.getElementById('total-words').textContent = total;
        document.getElementById('learned-words').textContent = learned;
        document.getElementById('learning-words').textContent = learning;
        document.getElementById('review-words').textContent = review;

        // 更新進度條
        const progress = total > 0 ? Math.round((learned / total) * 100) : 0;
        document.getElementById('progress-fill').style.width = progress + '%';
        document.getElementById('progress-fill').textContent = progress + '%';
        document.getElementById('progress-text').textContent = progress + '%';

        // 更新最近學習的單字
        this.updateRecentWords();
    }

    updateRecentWords() {
        const recentWordsContainer = document.getElementById('recent-words-list');
        const recentWords = this.words
            .filter(w => w.lastReview !== null)
            .sort((a, b) => b.lastReview - a.lastReview)
            .slice(0, 6);

        if (recentWords.length === 0) {
            recentWordsContainer.innerHTML = '<p class="empty-message">暫無最近學習的單字</p>';
            return;
        }

        recentWordsContainer.innerHTML = recentWords.map(word => `
            <div class="recent-word-item">
                <div class="recent-word-english">${word.english}</div>
                <div class="recent-word-meaning">${word.meaning}</div>
            </div>
        `).join('');
    }

    // ========== 學習模式 ==========
    initializeLearning() {
        this.currentIndex = 0;
        this.startTime = Date.now();
        this.filterType = 'all';
        this.loadWordCard();
        this.updateLearningProgress();
        
        // 選中第一個過濾按鈕
        document.querySelectorAll('.filter-btn').forEach((btn, idx) => {
            btn.classList.toggle('active', idx === 0);
        });
    }

    getFilteredWords() {
        let filtered = this.words;

        if (this.filterType === 'new') {
            filtered = filtered.filter(w => w.status === 'new');
        } else if (this.filterType === 'review') {
            filtered = filtered.filter(w => w.status === 'review');
        } else if (this.filterType === 'learned') {
            filtered = filtered.filter(w => w.status === 'learned');
        }

        return filtered;
    }

    loadWordCard() {
        const filtered = this.getFilteredWords();
        const wordCard = document.getElementById('word-card');
        const wordInfo = document.getElementById('word-info');

        if (filtered.length === 0) {
            wordCard.innerHTML = '<div style="position: absolute; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f0f0f0; border-radius: 15px;">暫無單字</div>';
            wordInfo.innerHTML = '<p class="empty-message">暫無單字</p>';
            return;
        }

        const word = filtered[this.currentIndex];
        wordCard.classList.remove('flipped');
        wordCard.innerHTML = `
            <div class="card-front">
                <div>${word.english}</div>
                <small>${word.pronunciation || '點擊查看'}</small>
            </div>
            <div class="card-back" style="display: none;">
                <div>${word.meaning}</div>
                <small>點擊返回</small>
            </div>
        `;

        // 更新詳情
        wordInfo.innerHTML = `
            <div class="word-info-item">
                <div class="word-label">英文單字</div>
                <div class="word-value">${word.english}</div>
            </div>
            <div class="word-info-item">
                <div class="word-label">音標</div>
                <div class="word-value">${word.pronunciation || '暫無'}</div>
            </div>
            <div class="word-info-item">
                <div class="word-label">中文定義</div>
                <div class="word-value">${word.meaning}</div>
            </div>
            ${word.example ? `
            <div class="word-info-item">
                <div class="word-label">例句</div>
                <div class="word-value" style="font-style: italic;">${word.example}</div>
                <div class="word-value" style="margin-top: 5px; color: var(--text-secondary);">${word.exampleZh || ''}</div>
            </div>
            ` : ''}
            <div class="word-info-item">
                <div class="word-label">分類</div>
                <div class="word-value">${word.category || '未分類'}</div>
            </div>
            <div class="word-info-item">
                <div class="word-label">難度</div>
                <div class="word-value">${this.getDifficultyLabel(word.difficulty)}</div>
            </div>
            <div class="word-info-item">
                <div class="word-label">狀態</div>
                <div class="word-value">${this.getStatusLabel(word.status)}</div>
            </div>
            <div class="word-info-item">
                <div class="word-label">複習次數</div>
                <div class="word-value">${word.reviewCount} 次</div>
            </div>
        `;
    }

    toggleCardFlip() {
        const card = document.getElementById('word-card');
        card.classList.toggle('flipped');

        if (card.classList.contains('flipped')) {
            card.querySelector('.card-front').style.display = 'none';
            card.querySelector('.card-back').style.display = 'flex';
        } else {
            card.querySelector('.card-front').style.display = 'flex';
            card.querySelector('.card-back').style.display = 'none';
        }
    }

    nextWord() {
        const filtered = this.getFilteredWords();
        if (filtered.length === 0) return;

        this.currentIndex = (this.currentIndex + 1) % filtered.length;
        this.loadWordCard();
        this.updateLearningProgress();
    }

    previousWord() {
        const filtered = this.getFilteredWords();
        if (filtered.length === 0) return;

        this.currentIndex = (this.currentIndex - 1 + filtered.length) % filtered.length;
        this.loadWordCard();
        this.updateLearningProgress();
    }

    updateLearningProgress() {
        const filtered = this.getFilteredWords();
        document.getElementById('current-index').textContent = filtered.length > 0 ? this.currentIndex + 1 : 0;
        document.getElementById('total-index').textContent = filtered.length;
    }

    markAsLearned() {
        const filtered = this.getFilteredWords();
        if (filtered.length === 0) return;

        const word = filtered[this.currentIndex];
        word.status = word.status === 'learned' ? 'learning' : 'learned';
        word.lastReview = Date.now();
        word.reviewCount += 1;

        this.recordDailyStats();
        this.saveData();
        this.updateDashboard();
        this.nextWord();

        // 簡單提示
        this.showNotification(word.status === 'learned' ? '✓ 已標記為已學習！' : '標記為學習中');
    }

    pronounceWord() {
        const filtered = this.getFilteredWords();
        if (filtered.length === 0) return;

        const word = filtered[this.currentIndex];
        const utterance = new SpeechSynthesisUtterance(word.english);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }

    filterWords(filterType) {
        this.filterType = filterType;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filterType);
        });
        this.currentIndex = 0;
        this.loadWordCard();
        this.updateLearningProgress();
    }

    // ========== 新增單字 ==========
    addWord() {
        const english = document.getElementById('word-input').value.trim();
        const meaning = document.getElementById('meaning-input').value.trim();

        if (!english || !meaning) {
            this.showError('word-error', '請填寫英文和中文定義');
            this.showError('meaning-error', '請填寫英文和中文定義');
            return;
        }

        // 檢查是否已存在
        if (this.words.some(w => w.english.toLowerCase() === english.toLowerCase())) {
            this.showError('word-error', '此單字已存在');
            return;
        }

        const newWord = {
            id: Math.max(...this.words.map(w => w.id), 0) + 1,
            english: english,
            meaning: meaning,
            pronunciation: document.getElementById('pronunciation-input').value.trim(),
            example: document.getElementById('example-input').value.trim(),
            exampleZh: document.getElementById('example-zh-input').value.trim(),
            category: document.getElementById('category-input').value.trim(),
            difficulty: document.getElementById('difficulty-input').value,
            status: 'new',
            lastReview: null,
            reviewCount: 0,
            createdAt: Date.now()
        };

        this.words.push(newWord);
        this.saveData();
        this.clearForm();
        this.displayWords();
        this.updateDashboard();
        this.showNotification('✓ 單字已新增！');
    }

    submitBatchWords() {
        const input = document.getElementById('batch-input').value.trim();
        if (!input) {
            alert('請輸入單字數據');
            return;
        }

        const lines = input.split('\n').filter(line => line.trim());
        let successCount = 0;

        lines.forEach(line => {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length >= 2) {
                const english = parts[0];
                const meaning = parts[1];
                const example = parts[2] || '';

                if (!this.words.some(w => w.english.toLowerCase() === english.toLowerCase())) {
                    this.words.push({
                        id: Math.max(...this.words.map(w => w.id), 0) + 1,
                        english: english,
                        meaning: meaning,
                        pronunciation: '',
                        example: example,
                        exampleZh: '',
                        category: '批量匯入',
                        difficulty: 'medium',
                        status: 'new',
                        lastReview: null,
                        reviewCount: 0,
                        createdAt: Date.now()
                    });
                    successCount++;
                }
            }
        });

        if (successCount > 0) {
            this.saveData();
            this.displayWords();
            this.updateDashboard();
            this.toggleBatchSection();
            document.getElementById('batch-input').value = '';
            this.showNotification(`✓ 成功新增 ${successCount} 個單字！`);
        } else {
            alert('未能新增任何單字。請檢查格式或檢查是否有重複。');
        }
    }

    toggleBatchSection() {
        const section = document.querySelector('.batch-add-section');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }

    clearForm() {
        document.getElementById('word-input').value = '';
        document.getElementById('pronunciation-input').value = '';
        document.getElementById('meaning-input').value = '';
        document.getElementById('example-input').value = '';
        document.getElementById('example-zh-input').value = '';
        document.getElementById('category-input').value = '';
        document.getElementById('difficulty-input').value = 'medium';
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    }

    displayWords(searchTerm = '') {
        let words = this.words;

        if (searchTerm) {
            words = words.filter(w => 
                w.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
                w.meaning.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        const wordsList = document.getElementById('words-list');
        if (words.length === 0) {
            wordsList.innerHTML = '<p class="empty-message">暫無單字</p>';
            return;
        }

        wordsList.innerHTML = words.map(word => `
            <div class="word-item">
                <div class="word-item-content">
                    <div class="word-item-english">${word.english}</div>
                    <div class="word-item-meaning">${word.meaning}</div>
                </div>
                <div class="word-item-actions">
                    <button class="word-item-edit" onclick="vocabularySystem.editWord(${word.id})">編輯</button>
                    <button class="word-item-delete" onclick="vocabularySystem.deleteWord(${word.id})">刪除</button>
                </div>
            </div>
        `).join('');
    }

    searchWords(searchTerm) {
        this.displayWords(searchTerm);
    }

    editWord(id) {
        const word = this.words.find(w => w.id === id);
        if (!word) return;

        document.getElementById('word-input').value = word.english;
        document.getElementById('pronunciation-input').value = word.pronunciation;
        document.getElementById('meaning-input').value = word.meaning;
        document.getElementById('example-input').value = word.example;
        document.getElementById('example-zh-input').value = word.exampleZh;
        document.getElementById('category-input').value = word.category;
        document.getElementById('difficulty-input').value = word.difficulty;

        // 修改按鈕功能
        const addBtn = document.getElementById('add-word-btn');
        const originalText = addBtn.textContent;
        addBtn.textContent = '更新單字';
        
        addBtn.onclick = () => {
            word.english = document.getElementById('word-input').value.trim();
            word.meaning = document.getElementById('meaning-input').value.trim();
            word.pronunciation = document.getElementById('pronunciation-input').value.trim();
            word.example = document.getElementById('example-input').value.trim();
            word.exampleZh = document.getElementById('example-zh-input').value.trim();
            word.category = document.getElementById('category-input').value.trim();
            word.difficulty = document.getElementById('difficulty-input').value;

            this.saveData();
            this.clearForm();
            this.displayWords();
            this.updateDashboard();
            addBtn.textContent = originalText;
            addBtn.onclick = () => this.addWord();
            this.showNotification('✓ 單字已更新！');
        };

        window.scrollTo(0, 0);
    }

    deleteWord(id) {
        this.showModal('確認刪除', '確定要刪除此單字嗎？', () => {
            const index = this.words.findIndex(w => w.id === id);
            if (index > -1) {
                this.words.splice(index, 1);
                this.saveData();
                this.displayWords();
                this.updateDashboard();
                this.showNotification('✓ 單字已刪除！');
            }
        });
    }

    validateForm() {
        const wordError = document.getElementById('word-error');
        const meaningError = document.getElementById('meaning-error');
        const english = document.getElementById('word-input').value.trim();
        const meaning = document.getElementById('meaning-input').value.trim();

        wordError.textContent = '';
        meaningError.textContent = '';

        if (english && this.words.some(w => w.english.toLowerCase() === english.toLowerCase())) {
            wordError.textContent = '此單字已存在';
        }
    }

    // ========== 統計 ==========
    updateStatistics() {
        // 計算統計數據
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayMs = today.getTime();

        const week = new Date();
        week.setDate(week.getDate() - 7);
        const weekMs = week.getTime();

        const month = new Date();
        month.setMonth(month.getMonth() - 1);
        const monthMs = month.getTime();

        const todayLearned = this.words.filter(w => 
            w.lastReview && w.lastReview >= todayMs
        ).length;

        const weekLearned = this.words.filter(w => 
            w.lastReview && w.lastReview >= weekMs
        ).length;

        const monthLearned = this.words.filter(w => 
            w.lastReview && w.lastReview >= monthMs
        ).length;

        const totalTime = Math.round((Date.now() - this.sessionStartTime) / 60000);

        document.getElementById('today-learned').textContent = todayLearned;
        document.getElementById('week-learned').textContent = weekLearned;
        document.getElementById('month-learned').textContent = monthLearned;
        document.getElementById('total-time').textContent = totalTime + '分鐘';

        // 難度分布
        const easy = this.words.filter(w => w.difficulty === 'easy').length;
        const medium = this.words.filter(w => w.difficulty === 'medium').length;
        const hard = this.words.filter(w => w.difficulty === 'hard').length;
        const total = this.words.length;

        const easyPercent = total > 0 ? (easy / total) * 100 : 0;
        const mediumPercent = total > 0 ? (medium / total) * 100 : 0;
        const hardPercent = total > 0 ? (hard / total) * 100 : 0;

        document.getElementById('easy-bar').style.width = easyPercent + '%';
        document.getElementById('medium-bar').style.width = mediumPercent + '%';
        document.getElementById('hard-bar').style.width = hardPercent + '%';

        document.getElementById('easy-count').textContent = easy;
        document.getElementById('medium-count').textContent = medium;
        document.getElementById('hard-count').textContent = hard;
    }

    resetStats() {
        this.showModal('重置統計', '確定要重置所有統計數據嗎？', () => {
            this.words.forEach(word => {
                word.lastReview = null;
                word.reviewCount = 0;
                word.status = 'new';
            });
            this.dailyStats = {};
            this.sessionStartTime = Date.now();
            this.saveData();
            this.updateStatistics();
            this.updateDashboard();
            this.showNotification('✓ 統計已重置！');
        });
    }

    exportStats() {
        const stats = {
            exportDate: new Date().toLocaleString('zh-TW'),
            totalWords: this.words.length,
            learnedWords: this.words.filter(w => w.status === 'learned').length,
            learningWords: this.words.filter(w => w.status === 'learning').length,
            reviewWords: this.words.filter(w => w.status === 'review').length,
            difficultyStats: {
                easy: this.words.filter(w => w.difficulty === 'easy').length,
                medium: this.words.filter(w => w.difficulty === 'medium').length,
                hard: this.words.filter(w => w.difficulty === 'hard').length
            }
        };

        this.downloadJSON(stats, 'vocabulary-statistics.json');
        this.showNotification('✓ 統計已匯出！');
    }

    recordDailyStats() {
        const date = new Date().toISOString().split('T')[0];
        if (!this.dailyStats[date]) {
            this.dailyStats[date] = 0;
        }
        this.dailyStats[date]++;
    }

    // ========== 資料管理 ==========
    saveData() {
        const data = {
            words: this.words,
            dailyStats: this.dailyStats
        };
        localStorage.setItem('vocabulary_system', JSON.stringify(data));
    }

    exportData() {
        this.downloadJSON({
            words: this.words,
            stats: this.dailyStats,
            exportDate: new Date().toISOString()
        }, 'vocabulary-data.json');
        this.showNotification('✓ 資料已匯出！');
    }

    importData() {
        document.getElementById('file-input').click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.words && Array.isArray(data.words)) {
                    this.words = data.words;
                    this.dailyStats = data.stats || {};
                    this.saveData();
                    this.updateDashboard();
                    this.showNotification('✓ 資料已成功匯入！');
                } else {
                    alert('檔案格式不正確');
                }
            } catch (error) {
                alert('無法讀取檔案：' + error.message);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ========== 快速複習 ==========
    startQuickReview() {
        const reviewWords = this.words.filter(w => w.status === 'review' || w.status === 'new');
        if (reviewWords.length === 0) {
            alert('暫無可複習的單字');
            return;
        }
        this.switchView('learning');
        this.filterType = 'review';
        this.currentIndex = 0;
        document.querySelectorAll('.filter-btn')[2].click();
    }

    // ========== 工具函數 ==========
    getDifficultyLabel(difficulty) {
        const labels = {
            'easy': '簡單 ⭐',
            'medium': '中等 ⭐⭐',
            'hard': '困難 ⭐⭐⭐'
        };
        return labels[difficulty] || difficulty;
    }

    getStatusLabel(status) {
        const labels = {
            'new': '新單字 📝',
            'learning': '學習中 📚',
            'review': '待複習 🔄',
            'learned': '已學習 ✓'
        };
        return labels[status] || status;
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 9999;
            animation: slideUp 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    showModal(title, message, onConfirm) {
        const modal = document.getElementById('confirmation-modal');
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;
        modal.style.display = 'flex';

        this.pendingModalConfirm = onConfirm;
    }

    handleModalConfirm() {
        if (this.pendingModalConfirm) {
            this.pendingModalConfirm();
        }
        this.closeModal();
    }

    closeModal() {
        document.getElementById('confirmation-modal').style.display = 'none';
        this.pendingModalConfirm = null;
    }
}

// ========== 初始化應用 ==========
let vocabularySystem;

document.addEventListener('DOMContentLoaded', () => {
    vocabularySystem = new VocabularySystem();
});

// 定期保存資料
setInterval(() => {
    if (vocabularySystem) {
        vocabularySystem.saveData();
    }
}, 30000);
