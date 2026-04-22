class GoalTracker {
    constructor(formSelector, goalsListSelector, sortButtonSelector) {
        this.form = document.querySelector(formSelector);
        this.titleInput = this.form.querySelector('#goal-title');
        this.descInput = this.form.querySelector('#goal-desc');
        this.deadlineInput = this.form.querySelector('#goal-deadline');
        this.priorityInput = this.form.querySelector('#goal-priority');
        this.categoryInput = this.form.querySelector('#goal-category');
        this.customCategoryInput = this.form.querySelector('#custom-category');
        this.addCategoryButton = this.form.querySelector('#add-category-btn');
        this.categoryPillList = this.form.querySelector('#category-pill-list');
        this.goalList = document.querySelector(goalsListSelector);
        this.sortButton = document.querySelector(sortButtonSelector);
        this.categoryFilter = document.getElementById('category-filter');
        this.modal = document.getElementById('goal-modal');
        this.openModalButton = document.getElementById('open-goal-modal');
        this.closeModalButton = document.getElementById('close-goal-modal');

        this.defaultCategories = {
            personal: 'Kişisel',
            work: 'İş',
            fitness: 'Fitness',
            study: 'Çalışma',
            other: 'Diğer',
        };

        this.categories = this.loadCategoriesFromStorage();

        this.priorityLabels = {
            low: 'Düşük Öncelik',
            medium: 'Orta Öncelik',
            high: 'Yüksek Öncelik',
        };

        this.goals = this.loadGoalsFromStorage();

        this.populateCategoryOptions();
        this.renderCategoryPills();
        this.addEventListeners();
        this.renderGoals();
    }

    loadCategoriesFromStorage() {
        const storedCategories = JSON.parse(localStorage.getItem('goalCategories')) || {};
        return { ...this.defaultCategories, ...storedCategories };
    }

    loadGoalsFromStorage() {
        const storedGoals = JSON.parse(localStorage.getItem('goals')) || [];

        return storedGoals.map((goal, index) => ({
            id: goal.id || `goal-${Date.now()}-${index}`,
            title: goal.title || '',
            desc: goal.desc || '',
            deadline: goal.deadline || '',
            priority: goal.priority || 'medium',
            category: goal.category || 'other',
            completed: Boolean(goal.completed),
        }));
    }

    saveGoalsToStorage() {
        localStorage.setItem('goals', JSON.stringify(this.goals));
    }

    saveCategoriesToStorage() {
        const customCategories = Object.fromEntries(
            Object.entries(this.categories).filter(([key]) => !(key in this.defaultCategories))
        );

        localStorage.setItem('goalCategories', JSON.stringify(customCategories));
    }

    addEventListeners() {
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.addGoal();
        });

        this.sortButton.addEventListener('click', () => {
            this.sortGoalsByDate();
            this.renderGoals();
        });

        this.categoryFilter.addEventListener('change', () => {
            this.renderGoals();
        });

        this.openModalButton.addEventListener('click', () => {
            this.openModal();
        });

        this.closeModalButton.addEventListener('click', () => {
            this.closeModal();
        });

        this.modal.addEventListener('click', (event) => {
            if (event.target.hasAttribute('data-close-modal')) {
                this.closeModal();
            }
        });

        this.addCategoryButton.addEventListener('click', () => {
            this.addCategory();
        });

        this.customCategoryInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.addCategory();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.modal.classList.contains('is-open')) {
                this.closeModal();
            }
        });
    }

    addGoal() {
        const goal = {
            id: `goal-${Date.now()}`,
            title: this.titleInput.value.trim(),
            desc: this.descInput.value.trim(),
            deadline: this.deadlineInput.value,
            priority: this.priorityInput.value,
            category: this.categoryInput.value,
            completed: false,
        };

        this.goals.unshift(goal);
        this.saveGoalsToStorage();
        this.clearForm();
        this.renderGoals();
        this.closeModal();
    }

    openModal() {
        this.modal.classList.add('is-open');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        requestAnimationFrame(() => this.titleInput.focus());
    }

    closeModal() {
        this.modal.classList.remove('is-open');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        this.openModalButton.focus();
    }

    toggleCompletion(goalId) {
        this.goals = this.goals.map((goal) => (
            goal.id === goalId
                ? { ...goal, completed: !goal.completed }
                : goal
        ));

        this.saveGoalsToStorage();
        this.renderGoals();
    }

    deleteGoal(goalId) {
        this.goals = this.goals.filter((goal) => goal.id !== goalId);
        this.saveGoalsToStorage();
        this.renderGoals();
    }

    sortGoalsByDate() {
        this.goals.sort((firstGoal, secondGoal) => new Date(firstGoal.deadline) - new Date(secondGoal.deadline));
    }

    normalizeCategoryKey(value) {
        return value
            .trim()
            .toLocaleLowerCase('tr-TR')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    addCategory() {
        const label = this.customCategoryInput.value.trim();

        if (!label) {
            return;
        }

        const key = this.normalizeCategoryKey(label);

        if (!key) {
            this.customCategoryInput.value = '';
            return;
        }

        this.categories[key] = label;
        this.saveCategoriesToStorage();
        this.populateCategoryOptions();
        this.renderCategoryPills();

        this.categoryInput.value = key;
        this.categoryFilter.value = 'all';
        this.customCategoryInput.value = '';
    }

    populateCategoryOptions() {
        const categoryOptions = Object.entries(this.categories);

        this.categoryInput.innerHTML = categoryOptions
            .map(([key, label]) => `<option value="${key}">${label}</option>`)
            .join('');

        this.categoryFilter.innerHTML = `
            <option value="all">Tümü</option>
            ${categoryOptions.map(([key, label]) => `<option value="${key}">${label}</option>`).join('')}
        `;
    }

    renderCategoryPills() {
        this.categoryPillList.innerHTML = Object.values(this.categories)
            .map((label) => `<span class="category-pill">${label}</span>`)
            .join('');
    }

    getFilteredGoals() {
        const selectedCategory = this.categoryFilter.value;

        if (selectedCategory === 'all') {
            return this.goals;
        }

        return this.goals.filter((goal) => goal.category === selectedCategory);
    }

    calculateDaysLeft(deadline) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(0, 0, 0, 0);

        return Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    }

    formatDate(deadline) {
        const date = new Date(deadline);
        return new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(date);
    }

    getDeadlineLabel(deadline) {
        const daysLeft = this.calculateDaysLeft(deadline);

        if (daysLeft < 0) {
            return `${Math.abs(daysLeft)} gün gecikti`;
        }

        if (daysLeft === 0) {
            return 'Bugün tamamlanmalı';
        }

        if (daysLeft === 1) {
            return '1 gün kaldı';
        }

        return `${daysLeft} gün kaldı`;
    }

    createGoalCard(goal) {
        const card = document.createElement('article');
        card.className = `goal-card ${goal.category} ${goal.priority}-priority`;

        if (goal.completed) {
            card.classList.add('completed');
        }

        const info = document.createElement('div');
        info.className = 'goal-info';

        const header = document.createElement('div');
        header.className = 'goal-card-header';

        const textBlock = document.createElement('div');

        const title = document.createElement('h3');
        title.className = 'goal-title';
        title.textContent = goal.title;

        const deadline = document.createElement('div');
        deadline.className = 'goal-deadline';
        deadline.textContent = `${this.formatDate(goal.deadline)} • ${this.getDeadlineLabel(goal.deadline)}`;

        const desc = document.createElement('div');
        desc.className = 'goal-desc';
        desc.textContent = goal.desc || 'Bu hedef için açıklama eklenmedi.';

        textBlock.appendChild(title);
        textBlock.appendChild(deadline);

        const status = document.createElement('span');
        status.className = 'meta-pill status-pill';
        status.textContent = goal.completed ? 'Tamamlandı' : 'Devam Ediyor';

        header.appendChild(textBlock);
        header.appendChild(status);

        const meta = document.createElement('div');
        meta.className = 'goal-meta';

        const categoryBadge = document.createElement('span');
        categoryBadge.className = 'meta-pill category-badge';
        categoryBadge.textContent = this.categories[goal.category] || 'Diğer';

        const priorityBadge = document.createElement('span');
        priorityBadge.className = `meta-pill priority-badge ${goal.priority}`;
        priorityBadge.textContent = this.priorityLabels[goal.priority] || 'Orta Öncelik';

        meta.appendChild(categoryBadge);
        meta.appendChild(priorityBadge);

        const actions = document.createElement('div');
        actions.className = 'goal-actions';

        const completeBtn = document.createElement('button');
        completeBtn.className = 'complete-btn';
        completeBtn.type = 'button';
        completeBtn.textContent = goal.completed ? 'Tamamlanmadı Olarak İşaretle' : 'Tamamlandı Olarak İşaretle';
        completeBtn.addEventListener('click', () => this.toggleCompletion(goal.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.type = 'button';
        deleteBtn.textContent = 'Hedefi Sil';
        deleteBtn.addEventListener('click', () => this.deleteGoal(goal.id));

        actions.appendChild(completeBtn);
        actions.appendChild(deleteBtn);

        info.appendChild(header);
        info.appendChild(desc);
        info.appendChild(meta);

        card.appendChild(info);
        card.appendChild(actions);

        return card;
    }

    renderGoals() {
        const filteredGoals = this.getFilteredGoals();
        this.goalList.innerHTML = '';

        if (filteredGoals.length === 0) {
            this.goalList.innerHTML = `
                <div class="empty-state">
                    <h3 class="goal-title">Henüz hedef görünmüyor</h3>
                    <p>Yeni bir hedef ekleyebilir ya da seçili filtreyi değiştirerek kayıtlı hedeflerine dönebilirsin.</p>
                </div>
            `;
            this.updateStats();
            return;
        }

        filteredGoals.forEach((goal) => {
            this.goalList.appendChild(this.createGoalCard(goal));
        });

        this.updateStats();
    }

    clearForm() {
        this.form.reset();
    }

    updateStats() {
        const total = this.goals.length;
        const completed = this.goals.filter((goal) => goal.completed).length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const topCategory = this.getTopCategory();

        document.getElementById('total-count').textContent = total;
        document.getElementById('completed-count').textContent = completed;
        document.getElementById('completion-rate').textContent = `${rate}%`;
        document.getElementById('completion-rate-badge').textContent = `${rate}%`;
        document.getElementById('top-category').textContent = topCategory;
        document.getElementById('progress-text').textContent = `${completed} / ${total} tamamlandı`;
        document.getElementById('progress-bar').style.width = `${rate}%`;
    }

    getTopCategory() {
        if (this.goals.length === 0) {
            return '-';
        }

        const categoryCount = this.goals.reduce((accumulator, goal) => {
            accumulator[goal.category] = (accumulator[goal.category] || 0) + 1;
            return accumulator;
        }, {});

        const [topCategory] = Object.entries(categoryCount).sort((firstEntry, secondEntry) => secondEntry[1] - firstEntry[1])[0];

        return this.categories[topCategory] || 'Diğer';
    }
}

const goalTracker = new GoalTracker('#goal-form', '#goal-list', '#sort-date-btn');
const toggleButton = document.getElementById('theme-toggle');

function syncThemeButton() {
    const isDark = document.body.classList.contains('dark-mode');
    toggleButton.textContent = isDark ? '☀️ Aydınlık Mod' : '🌙 Karanlık Mod';
}

toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    syncThemeButton();
});

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
    } else {
        document.body.classList.add('dark-mode');
    }

    syncThemeButton();
});
