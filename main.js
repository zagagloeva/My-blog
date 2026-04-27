// renderPosts();

// renderSinglePost();
// ---------- ХРАНИЛИЩЕ ----------
const STORAGE_KEY = "psychologist_posts";

// получить все посты
function getPosts() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

// сохранить посты
function savePosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

// добавить новый пост
function addPost(title, author, content) {
    const posts = getPosts();
    const newPost = {
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        title: title.trim(),
        author: author.trim() || "Аноним",
        content: content.trim(),
        createdAt: new Date().toISOString()
    };
    if (!newPost.title) { alert("Введите название"); return null; }
    if (!newPost.content) { alert("Напишите текст истории"); return null; }
    posts.unshift(newPost);
    savePosts(posts);
    return newPost;
}

// обновить пост
function updatePost(id, newTitle, newAuthor, newContent) {
    let posts = getPosts();
    const index = posts.findIndex(p => p.id == id);
    if (index === -1) return false;
    if (!newTitle.trim()) { alert("Название не может быть пустым"); return false; }
    if (!newContent.trim()) { alert("Текст не может быть пустым"); return false; }
    posts[index].title = newTitle.trim();
    posts[index].author = newAuthor.trim() || "Аноним";
    posts[index].content = newContent.trim();
    savePosts(posts);
    return true;
}

// удалить пост
function deletePost(id) {
    if (confirm("Точно удалить эту историю?")) {
        let posts = getPosts();
        const filtered = posts.filter(p => p.id != id);
        savePosts(filtered);
        renderAllCards();   // перерисовка
        return true;
    }
    return false;
}

// ---------- Экранирование (чтобы HTML не ломался) ----------
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>,]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function (c) {
        return c;
    });
}

// ---------- ОТРИСОВКА КАРТОЧЕК (с троеточием для сворачивания/разворачивания) ----------
function renderAllCards() {
    const grid = document.getElementById('cardsGrid');
    const posts = getPosts();

    if (posts.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px; background:#fff6eb; border-radius: 48px;">✨ Ни одной истории пока нет. Нажмите «+ Создать новую историю»</div>`;
        return;
    }

    let html = '';
    for (let post of posts) {
        const safeTitle = escapeHtml(post.title);
        const safeAuthor = escapeHtml(post.author);
        const safeFullContent = escapeHtml(post.content).replace(/\n/g, '<br>');

        // Каждая карточка получает уникальный id контейнера для текста, чтобы управлять разворотом
        const uniqueId = `text - ${post.id}`;
        html += `
            <div class="card" data-id="${post.id}">
                <div class="card-header">${safeTitle}</div>
                <div class="card-author">✍️ ${safeAuthor}</div>
                <div id="${uniqueId}" class="card-text collapsed">${safeFullContent}</div>
                <button class="dots-btn" data-target="${uniqueId}">...</button>
                <div class="card-buttons">
                    <button class="edit-btn" data-id="${post.id}">✏️ Редактировать</button>
                    <button class="copy-link-btn" data-id="${post.id}" data-title="${escapeHtml(post.title)}">🔗 Копировать ссылку (Telegram)</button>
                    <button class="delete-btn" data-id="${post.id}">🗑 Удалить</button>
                </div>
            </div>
            `;
    }
    grid.innerHTML = html;

    // Навешиваем события для троеточия (переключатель collapsed / expanded)

    document.querySelectorAll('.dots-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = btn.getAttribute('data-target');
            const textDiv = document.getElementById(targetId);
            if (textDiv) {
                if (textDiv.classList.contains('collapsed')) {
                    textDiv.classList.remove('collapsed');
                    textDiv.classList.add('expanded');
                } else {
                    textDiv.classList.remove('expanded');
                    textDiv.classList.add('collapsed');
                }
            }
        });
    });

    // Редактирование
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            openEditModal(id);
        });
    });

    document.querySelectorAll('.copy-link-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            const title = btn.getAttribute('data-title');
            copyPostLink(id, title);
        });

    });


    // Удаление
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            deletePost(id);
        });
    });
}

// ---------- МОДАЛЬНОЕ ОКНО ДЛЯ СОЗДАНИЯ / РЕДАКТИРОВАНИЯ ----------
let currentEditId = null;  // null = создание нового

function closeModal() {
    const modal = document.getElementById('modalForm');
    modal.classList.add('hidden');
    currentEditId = null;
    // очищаем поля
    document.getElementById('storyTitle').value = '';
    document.getElementById('storyAuthor').value = '';
    document.getElementById('storyContent').value = '';
}

function openCreateModal() {
    currentEditId = null;
    document.getElementById('modalTitle').innerText = '➕ Новая история';
    document.getElementById('storyTitle').value = '';
    document.getElementById('storyAuthor').value = '';
    document.getElementById('storyContent').value = '';
    document.getElementById('modalForm').classList.remove('hidden');
}

function openEditModal(id) {
    const posts = getPosts();
    const post = posts.find(p => p.id == id);
    if (!post) return;
    currentEditId = id;
    document.getElementById('modalTitle').innerText = '✏️ Редактировать историю';
    document.getElementById('storyTitle').value = post.title;
    document.getElementById('storyAuthor').value = post.author;
    document.getElementById('storyContent').value = post.content;
    document.getElementById('modalForm').classList.remove('hidden');
}

function saveFromModal() {
    const title = document.getElementById('storyTitle').value;
    const author = document.getElementById('storyAuthor').value;
    const content = document.getElementById('storyContent').value;

    if (currentEditId === null) {
        // создание
        addPost(title, author, content);
    } else {
        // обновление
        updatePost(currentEditId, title, author, content);
    }
    closeModal();
    renderAllCards();
}

function showStoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'story') {
        const title = decodeURIComponent(params.get('title') || '');
        const author = decodeURIComponent(params.get('author') || '');
        const text = decodeURIComponent(params.get('text') || '');
        if (!title || !text) return false;

        // Скрываем лишние элементы
        const createBtn = document.getElementById('createBtn');
        if (createBtn) createBtn.style.display = 'none';
        const authBlock = document.getElementById('authBlock');
        if (authBlock) authBlock.style.display = 'none';
        const mainContent = document.getElementById('mainContent');
        if (mainContent) mainContent.style.display = 'none';

        // Настраиваем контейнер сетки на полный экран с отступами
        const grid = document.getElementById('cardsGrid');
        grid.style.display = 'flex';
        grid.style.flexDirection = 'column';
        grid.style.alignItems = 'center';
        grid.style.justifyContent = 'flex-start';
        grid.style.width = '100%';
        grid.style.minHeight = '100vh';
        grid.style.margin = '0';
        grid.style.padding = '0 8px 0';
        grid.style.boxSizing = 'border-box';

        const safeTitle = escapeHtml(title);
        const safeAuthor = escapeHtml(author);
        const safeContent = escapeHtml(text).replace(/\n/g, '<br>');

        grid.innerHTML =` 
            <div style="background:white; border-radius:32px; padding:28px; width:100%; max-width:800px; box-sizing:border-box;">
                <div style="text-align:center; color:#b7a17a; font-size:1.2rem; letter-spacing:2px; margin-bottom:16px;">
                    ﹏﹏﹏﹏ ✦ ﹏﹏﹏﹏
                </div>
                <h2 style="text-align:center; margin:0 0 8px 0;">${safeTitle}</h2>
                <div style="text-align:center; margin:0 0 20px 0;">
                    <span style="background:#f0eae2; padding:4px 16px; border-radius:40px;">✍️ ${safeAuthor}</span>
                </div>
                <div style="background:#fefaf5; padding:20px; border-radius:28px; overflow-y:auto; max-height:60vh;">
                    ${safeContent}
                </div>
                <div style="text-align:center; color:#b7a17a; font-size:1.2rem; letter-spacing:2px; margin-top:24px;">
                    ﹏﹏﹏﹏ ✦ ﹏﹏﹏﹏
                </div>
            </div>
        `;

        // Эффект скрытия заголовка при прокрутке вниз
        const header = document.querySelector('h1');
        if (header) {
            const handleScroll = () => {
                if (window.scrollY > 10) {
                    header.style.opacity = '0';
                    header.style.visibility = 'hidden';
                } else {
                    header.style.opacity = '1';
                    header.style.visibility = 'visible';
                }
            };
            window.addEventListener('scroll', handleScroll);
            handleScroll(); // проверить сразу
        }

        return true;
    }
    return false;
}
// ---------- ЗАПУСК ПРИ ЗАГРУЗКЕ ----------
document.addEventListener('DOMContentLoaded', () => {
    if (showStoryFromURL()) return;
    renderAllCards();

    const createBtn = document.getElementById('createBtn');
    createBtn.addEventListener('click', openCreateModal);

    const saveBtn = document.getElementById('saveStoryBtn');
    saveBtn.addEventListener('click', saveFromModal);

    const cancelBtn = document.getElementById('cancelModalBtn');
    cancelBtn.addEventListener('click', closeModal);

    // Закрытие модалки по клику на фон
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('modalForm');
        if (e.target === modal) closeModal();
    });

});
// Функция копирования ссылки для Telegram (с полными данными истории)
function copyPostLink(postId, postTitle) {
    const posts = getPosts();
    const post = posts.find(p => p.id == postId);
    if (!post) return;

    // Кодируем данные для безопасной передачи в URL
    const titleEnc = encodeURIComponent(post.title);
    const authorEnc = encodeURIComponent(post.author);
    const contentEnc = encodeURIComponent(post.content);

    const baseUrl = window.location.href.split('?')[0];
    const link = `${baseUrl}?view=story&title=${titleEnc}&author=${authorEnc}&text=${contentEnc}`;

    navigator.clipboard.writeText(link).then(() => {
        alert(`✅ Ссылка на "${postTitle}" скопирована!\nОтправьте её в Telegram – откроется прямо там.`);
    }).catch(() => {});
}






