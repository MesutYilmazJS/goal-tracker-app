class GoalTracker {
    constructor(formSelector, goalsListSelector, sortButtonSelector) {
        this.form = document.querySelector(formSelector);
        this.titleInput = this.form.querySelector('#goal-title');
        this.descInput = this.form.querySelector('#goal-desc');
        this.deadlineInput = this.form.querySelector('#goal-deadline');
        this.goalsList = document.querySelector(goalsListSelector);
        this.sortButton = document.querySelector(sortButtonSelector);
        this.goalList = document.getElementById('goal-list');

        this.goals = this.loadGoalsFromStorage();
        this.filter = 'all';  // 'all', 'completed', 'pending'
        document.getElementById('category-filter').addEventListener('change', () => {
            this.filterGoals();
        });

        this.addEventListeners();
        this.renderGoals();
    }

    // LocalStorage'dan hedefleri al
    loadGoalsFromStorage() {
        const storedGoals = JSON.parse(localStorage.getItem('goals'));
        return storedGoals ? storedGoals : [];
    }

    // LocalStorage'a hedefleri kaydet
    saveGoalsToStorage() {
        localStorage.setItem('goals', JSON.stringify(this.goals));
    }

    // Event listener'ları ekle
    addEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addGoal();
        });

        this.sortButton.addEventListener('click', () => {
            this.sortGoalsByDate();
            this.renderGoals();
        });

        const filterButtons = document.querySelectorAll('.filter-button');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.filter = e.target.dataset.filter;
                this.renderGoals();
            });
        });
    }

    // Hedef ekleme
    addGoal() {
        const goal = {
            title: this.titleInput.value,
            desc: this.descInput.value,
            deadline: this.deadlineInput.value,
            priority: this.form.querySelector('#goal-priority').value,
            category: this.form.querySelector('#goal-category').value,  // Kategori
            completed: false,
            completion: 0,
        };

        this.goals.push(goal);
        this.saveGoalsToStorage();
        this.renderGoals();
        this.clearForm();
    }


    // Hedefi tamamlandı olarak işaretle
    toggleCompletion(index) {
        this.goals[index].completed = !this.goals[index].completed;
        this.goals[index].completion = this.goals[index].completed ? 100 : 0; // Eğer tamamlandıysa %100, değilse %0
        this.saveGoalsToStorage();
        this.renderGoals();
    }

    // Hedefi sil
    deleteGoal(index) {
        this.goals.splice(index, 1);
        this.saveGoalsToStorage();
        this.renderGoals();
    }

    // Hedefi filtrele
    getFilteredGoals() {
        if (this.filter === 'completed') {
            return this.goals.filter(goal => goal.completed);
        } else if (this.filter === 'pending') {
            return this.goals.filter(goal => !goal.completed);
        }
        return this.goals; // 'all'
    }

    // Tarihe göre sıralama (en erken tarihten en geç tarihe)
    sortGoalsByDate() {
        this.goals.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }
    calculateDaysLeft(deadline) {
        const today = new Date();  // Bugünün tarihi
        const deadlineDate = new Date(deadline);  // Hedefin bitiş tarihi
        const timeDifference = deadlineDate - today;  // Zaman farkı (milisaniye)
        const daysLeft = Math.ceil(timeDifference / (1000 * 3600 * 24));  // Gün cinsinden fark

        return daysLeft;
    }
    // Hedef kartını oluştur
    createGoalCard(goal, index) {
        const card = document.createElement('div');
        card.className = 'goal-card';
        card.classList.add(goal.category); // Renk için

        // Kategori etiketi
        const categoryBadge = document.createElement('div');
        categoryBadge.className = 'category-badge';
        categoryBadge.textContent = goal.category.charAt(0).toUpperCase() + goal.category.slice(1);

        // Kartın içine bu etiketi ekliyoruz
        card.appendChild(categoryBadge);
        card.className = 'goal-card';

        // Kategoriye göre renk sınıfı ekle
        card.classList.add(goal.category);

        const info = document.createElement('div');
        info.className = 'goal-info';

        const title = document.createElement('div');
        title.className = 'goal-title';
        title.textContent = goal.title;

        const deadline = document.createElement('div');
        deadline.className = 'goal-deadline';
        const daysLeft = this.calculateDaysLeft(goal.deadline);
        deadline.textContent = `Tamamlanması gereken: ${goal.deadline} (${daysLeft} gün kaldı)`;

        const desc = document.createElement('div');
        desc.className = 'goal-desc';
        desc.textContent = goal.desc || '';

        info.appendChild(title);
        info.appendChild(deadline);
        info.appendChild(desc);

        const actions = document.createElement('div');
        actions.className = 'goal-actions';

        const completeBtn = document.createElement('button');
        completeBtn.textContent = goal.completed ? '✓ Tamamlandı' : '✓ Tamamla';
        completeBtn.onclick = () => this.toggleCompletion(index);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑 Sil';
        deleteBtn.onclick = () => this.deleteGoal(index);

        actions.appendChild(completeBtn);
        actions.appendChild(deleteBtn);

        card.appendChild(info);
        card.appendChild(actions);

        return card;
    }




    filterGoals() {
        const selectedCategory = document.getElementById('category-filter').value;

        let filteredGoals = this.goals;

        // Eğer kategori "Tümü" seçilmemişse, o kategoriye göre filtrele
        if (selectedCategory !== 'all') {
            filteredGoals = this.goals.filter(goal => goal.category === selectedCategory);
        }

        this.renderGoals(filteredGoals);
    }

    renderGoals(filteredGoals = this.goals) {
        this.goalList.innerHTML = ''; // Önceki listeleri temizle
        if (filteredGoals.length > 0) {
            filteredGoals.forEach((goal, index) => {
                const card = this.createGoalCard(goal, index);
                this.goalList.appendChild(card);
            });
            this.updateStats(); // ← buraya ekle
        } else {
            this.goalList.innerHTML = `
                <div class="goal-card">
                    <div class="goal-info">
                        <div class="goal-title">Bulunamadı</div>    
                    </div>
                </div>`
        }


    }

    // Formu temizle
    clearForm() {
        this.titleInput.value = '';
        this.descInput.value = '';
        this.deadlineInput.value = '';
    }

    updateStats() {
        const total = this.goals.length;
        const completed = this.goals.filter(goal => goal.completed).length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        document.getElementById('progress-bar').style.width = `${rate}%`;

        document.getElementById('total-count').textContent = total;
        document.getElementById('completed-count').textContent = completed;
        document.getElementById('completion-rate').textContent = `${rate}%`;
        // Kategori frekanslarını say
        const categoryCount = {};
        this.goals.forEach(goal => {
            categoryCount[goal.category] = (categoryCount[goal.category] || 0) + 1;
        });

        // En sık geçen kategoriyi bul
        let topCategory = '-';
        let max = 0;
        for (let category in categoryCount) {
            if (categoryCount[category] > max) {
                topCategory = category;
                max = categoryCount[category];
            }
        }

        // DOM'a yaz
        document.getElementById('top-category').textContent = topCategory;

    }

}

// Başlangıçta sınıfı başlatıyoruz
const goalTracker = new GoalTracker('#goal-form', '#goals-list', '#sort-date-btn');
const toggleButton = document.getElementById('theme-toggle');

toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    const isDark = document.body.classList.contains('dark-mode');
    toggleButton.textContent = isDark ? '☀️ Aydınlık Mod' : '🌙 Karanlık Mod';

    // Tercihi saklamak için (opsiyonel)
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Sayfa yüklendiğinde kullanıcının temasını yükle (opsiyonel)
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        toggleButton.textContent = '☀️ Aydınlık Mod';
    }
});
