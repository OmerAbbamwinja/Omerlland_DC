document.addEventListener('DOMContentLoaded', () => {
    // 1. Éléments du DOM
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const priorityInput = document.getElementById('priority-input');
    const taskList = document.getElementById('task-list');
    const searchBar = document.getElementById('search-bar');
    const exportBtn = document.getElementById('export-pdf');

    // 2. Initialisation de la base de données locale
    let tasks = JSON.parse(localStorage.getItem('omerlland_db')) || [];

    // 3. Logique de tri et sauvegarde
    const saveAndRender = () => {
        // Tri automatique : Priorité (3 > 2 > 1) puis Statut (Non-terminé d'abord)
        tasks.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed - b.completed;
            return b.priority - a.priority;
        });

        localStorage.setItem('omerlland_db', JSON.stringify(tasks));
        render();

        // Calcul et mise à jour de la progression
        // Calcul de la progression
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Mise à jour visuelle de la barre
        document.getElementById('progress-fill').style.width = percent + "%";
        document.getElementById('progress-percent').innerText = percent + "%";

        // Gestion du message de félicitations
        const congrats = document.getElementById('congrats-message');
        if (percent === 100 && total > 0) {
            congrats.classList.remove('congrats-hidden');
            congrats.classList.add('congrats-visible');
        } else {
            congrats.classList.remove('congrats-visible');
            congrats.classList.add('congrats-hidden');
        }

    };

    // 4. Affichage des tâches
    const render = (filter = "") => {
        taskList.innerHTML = '';
        const filteredTasks = tasks.filter(t => t.text.toLowerCase().includes(filter.toLowerCase()));

        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            const prioText = task.priority == 3 ? "Haute" : task.priority == 2 ? "Moyenne" : "Basse";

            li.innerHTML = `
                <div class="task-content">
                    <span class="prio-label">${prioText}</span>
                    <span class="task-title">${task.text}</span>
                </div>
                <div class="actions">
                    <button onclick="toggleTask(${index})"><i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i></button>
                    <button onclick="editTask(${index})"><i class="fas fa-pen"></i></button>
                    <button onclick="deleteTask(${index})"><i class="fas fa-trash"></i></button>
                </div>
            `;
            taskList.appendChild(li);
        });

        document.getElementById('stat-count').innerText = `${tasks.length} Missions`;
        document.getElementById('stat-done').innerText = `${tasks.filter(t => t.completed).length} Terminées`;
    };

    // 5. Gestion des événements
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        tasks.push({
            text: taskInput.value,
            priority: parseInt(priorityInput.value),
            completed: false
        });
        taskInput.value = '';
        saveAndRender();
    });

    searchBar.addEventListener('input', (e) => render(e.target.value));

    // 6. Fonctions globales pour les boutons de la liste
    window.toggleTask = (i) => { tasks[i].completed = !tasks[i].completed; saveAndRender(); };
    window.deleteTask = (i) => { if(confirm("Supprimer cette mission ?")) { tasks.splice(i, 1); saveAndRender(); } };
    window.editTask = (i) => {
        const val = prompt("Modifier la mission :", tasks[i].text);
        if(val) { tasks[i].text = val; saveAndRender(); }
    };

// 6. Export PDF Professionnel avec Pied de Page
if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const now = new Date().toLocaleString('fr-FR');
        const currentUser = localStorage.getItem('activeUser') || "Agent Omerlland";

        // --- EN-TÊTE ---
        doc.setFillColor(5, 5, 5);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(212, 175, 55);
        doc.setFontSize(20);
        doc.text("OMERLLAND DC - RAPPORT OFFICIEL", 20, 25);

        // --- CORPS DU DOCUMENT (LISTE DES TÂCHES) ---
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        let y = 60; // Position de départ pour les missions

        tasks.forEach((t, i) => {
            const status = t.completed ? "[TERMINEE]" : "[EN COURS]";
            doc.text(`${i+1}. ${t.text}`, 20, y);
            doc.setFontSize(8);
            doc.text(`   Statut: ${status} | Priorité: ${t.priority} | Créée le: ${t.date}`, 20, y + 5);
            doc.setFontSize(12);
            y += 15;

            // Gestion de nouvelle page si la liste est longue
            if (y > 250) {
                doc.addPage();
                y = 30;
            }
        });

        // --- PIED DE PAGE (C'est ici que s'affichent vos infos en bas) ---
        const pageHeight = doc.internal.pageSize.height; // Récupère la hauteur de page

        doc.setDrawColor(212, 175, 55);
        doc.line(20, pageHeight - 30, 190, pageHeight - 30); // Ligne de séparation dorée

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);

        // Date et Nom d'utilisateur en bas à gauche
        doc.text(`Généré le : ${now}`, 20, pageHeight - 20);
        doc.text(`Agent responsable : ${currentUser}`, 20, pageHeight - 15);

        // Signature du logiciel en bas à droite (centrée par rapport à l'axe)
        doc.setTextColor(212, 175, 55);
        doc.setFont("playfair", "italic");
        doc.text("Certifié par Omerlland DC System v2.0", 190, pageHeight - 15, { align: "right" });

        doc.save(`Rapport_Omerlland_${currentUser}.pdf`);
    });
}
    // Premier rendu au chargement
    render();
});

//connexion
// Données initiales
const DEFAULT_USER = { user: "admin", pass: "admin" };
let isLoginMode = true;

function toggleAuth() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? "Connexion - Omerlland DC" : "Inscription - Omerlland DC";
    document.getElementById('auth-btn').innerText = isLoginMode ? "Se connecter" : "Créer un compte";
    document.getElementById('auth-toggle').innerHTML = isLoginMode ? "Pas de compte ? <span onclick='toggleAuth()'>S'inscrire</span>" : "Déjà inscrit ? <span onclick='toggleAuth()'>Se connecter</span>";
}

document.getElementById('auth-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];

    if (isLoginMode) {
        // Vérification connexion
        const found = users.find(user => user.user === u && user.pass === p);
        if ((u === DEFAULT_USER.user && p === DEFAULT_USER.pass) || found) {
            loginSuccess();
        } else {
            alert("Identifiants incorrects");
        }
    } else {
        // Inscription
        if (users.some(user => user.user === u)) return alert("Utilisateur déjà existant");
        users.push({ user: u, pass: p });
        localStorage.setItem('users', JSON.stringify(users));
        alert("Compte créé ! Connectez-vous.");
        toggleAuth();
    }
});

// fonction loginSuccess pour inclure l'affichage du nom
function loginSuccess(u) {
    localStorage.setItem('activeUser', u); // Enregistre la session
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';

    // Affiche le nom de l'utilisateur s'il y a un élément prévu
    const userDisplay = document.getElementById('display-username');
    if(userDisplay) userDisplay.innerText = "Agent: " + u;
}

// capture date et heure pour chaque tâche
function addTask() {
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value;

    if (taskText.trim() === "") return;

    // 1. Créer la date et l'heure actuelle
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // 2. Créer l'élément de la liste
    const li = document.createElement('li');
    li.className = 'task-item';

    li.innerHTML = `
        <span class="task-content">${taskText}</span>
        <span class="task-date">Ajouté le : ${dateFormatted}</span>
    `;

    document.getElementById('task-list').appendChild(li);

    // Nettoyer l'input
    taskInput.value = "";

    // Si vous utilisez le localStorage, n'oubliez pas d'enregistrer 'dateFormatted' avec le texte
}
// déconnexion
window.logout = function() {
    // Supprime l'utilisateur actif de la mémoire locale
    localStorage.removeItem('activeUser');

    // Recharge la page pour réinitialiser l'état (retour au formulaire de connexion)
    location.reload();
};

