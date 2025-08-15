document.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMENT SELECTORS --- //
    const sidebar = document.getElementById('sidebar');
    const boardList = document.getElementById('board-list');
    const addBoardBtnSidebar = document.getElementById('add-board-btn-sidebar');
    const boardTitleEl = document.getElementById('board-title');
    const addListBtn = document.getElementById('add-list-btn');
    const boardView = document.getElementById('board-view');
    const modalContainer = document.getElementById('modal-container');
    const modal = document.getElementById('modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const searchInput = document.getElementById('search-input');

    // --- APPLICATION STATE --- //
    let state = {
        boards: [],
        activeBoardId: null,
        draggedElement: null,
    };

    // --- DATA PERSISTENCE (LocalStorage) --- //
    const saveState = () => {
        localStorage.setItem('taskFlowState', JSON.stringify(state));
    };

    const loadState = () => {
        const savedState = localStorage.getItem('taskFlowState');
        if (savedState) {
            state = JSON.parse(savedState);
        } else {
            // Initialize with a default board if no state exists
            const defaultBoard = {
                id: `board-${Date.now()}`,
                name: 'Welcome Board',
                lists: []
            };
            state.boards.push(defaultBoard);
            state.activeBoardId = defaultBoard.id;
        }
    };

    // --- UTILITY FUNCTIONS --- //
    const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const getActiveBoard = () => state.boards.find(b => b.id === state.activeBoardId);


    // --- RENDERING FUNCTIONS --- //

    function renderApp() {
        if (!state.activeBoardId && state.boards.length > 0) {
            state.activeBoardId = state.boards[0].id;
        }
        renderSidebar();
        renderBoard();
    }

    function renderSidebar() {
        boardList.innerHTML = '';
        state.boards.forEach(board => {
            const li = document.createElement('li');
            li.dataset.boardId = board.id;
            li.className = board.id === state.activeBoardId ? 'active' : '';
            li.innerHTML = `
                <span class="board-name-sidebar">${board.name}</span>
                <span class="board-actions">
                    <button class="edit-board-btn"><i class="fas fa-pen"></i></button>
                    <button class="delete-board-btn"><i class="fas fa-trash"></i></button>
                </span>
            `;
            boardList.appendChild(li);
        });
    }

    function renderBoard() {
        const board = getActiveBoard();
        if (!board) {
            boardTitleEl.textContent = 'No Board Selected';
            addListBtn.style.display = 'none';
            boardView.innerHTML = '<p style="padding: 20px; color: var(--text-secondary);">Create a board or select one from the sidebar to get started.</p>';
            return;
        }
        
        addListBtn.style.display = 'inline-block';
        boardTitleEl.textContent = board.name;
        boardView.innerHTML = '';

        const filterText = searchInput.value.toLowerCase();

        board.lists.forEach(list => {
            const listEl = document.createElement('div');
            listEl.className = 'list';
            listEl.dataset.listId = list.id;
            listEl.setAttribute('draggable', 'true');
            listEl.innerHTML = `
                <div class="list-header">
                    <h3 class="list-title">${list.name}</h3>
                    <div class="list-actions">
                        <button class="delete-list-btn"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="card-container"></div>
                <button class="add-card-btn"><i class="fas fa-plus"></i> Add a card</button>
            `;

            const cardContainer = listEl.querySelector('.card-container');
            list.cards
                .filter(card => card.title.toLowerCase().includes(filterText) || card.description.toLowerCase().includes(filterText))
                .forEach(card => {
                    const cardEl = createCardElement(card);
                    cardContainer.appendChild(cardEl);
                });

            boardView.appendChild(listEl);
        });
    }

    function createCardElement(card) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.dataset.cardId = card.id;
        cardEl.setAttribute('draggable', 'true');
        cardEl.innerHTML = `
            <div class="card-title">${card.title}</div>
            <div class="card-footer">
                <div class="card-labels">
                    ${card.labels.map(label => `<span style="background-color:${label.color}">${label.text}</span>`).join('')}
                </div>
                ${card.dueDate ? `<div class="due-date"><i class="far fa-clock"></i><span>${new Date(card.dueDate).toLocaleDateString()}</span></div>` : ''}
            </div>
        `;
        return cardEl;
    }


    // --- MODAL HANDLING --- //
    
    function showModal(title, content) {
        modal.querySelector('#modal-title').textContent = title;
        modal.querySelector('#modal-body').innerHTML = content;
        modalContainer.classList.remove('hidden');
    }

    function hideModal() {
        modalContainer.classList.add('hidden');
    }
    
    function showInputModal({ title, label, placeholder, initialValue = '', buttonText, onSave }) {
        const content = `
            <div class="form-group">
                <label for="modalInput">${label}</label>
                <input type="text" id="modalInput" placeholder="${placeholder}" value="${initialValue}">
            </div>
            <div class="modal-actions">
                <button id="modalSaveBtn" class="btn btn-primary">${buttonText}</button>
            </div>
        `;
        showModal(title, content);

        const input = document.getElementById('modalInput');
        const saveBtn = document.getElementById('modalSaveBtn');
        
        input.focus();
        input.select();

        const saveAction = () => {
            const value = input.value.trim();
            if (value) {
                onSave(value);
                hideModal();
            }
        };

        saveBtn.onclick = saveAction;
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveAction();
            }
        };
    }

    // --- CRUD OPERATIONS --- //

    // Board Operations
    function addBoard() {
        showInputModal({
            title: 'Create New Board',
            label: 'Board Name',
            placeholder: 'e.g., Project Phoenix',
            buttonText: 'Create Board',
            onSave: (name) => {
                const newBoard = { id: generateId('board'), name, lists: [] };
                state.boards.push(newBoard);
                state.activeBoardId = newBoard.id;
                saveState();
                renderApp();
            }
        });
    }

    function editBoard(boardId) {
        const board = state.boards.find(b => b.id === boardId);
        showInputModal({
            title: 'Edit Board Name',
            label: 'New Board Name',
            placeholder: 'e.g., Project Phoenix v2',
            initialValue: board.name,
            buttonText: 'Save Changes',
            onSave: (newName) => {
                board.name = newName;
                saveState();
                renderApp();
            }
        });
    }

    function deleteBoard(boardId) {
        if (confirm('Are you sure you want to delete this board and all its content?')) {
            state.boards = state.boards.filter(b => b.id !== boardId);
            if (state.activeBoardId === boardId) {
                state.activeBoardId = state.boards.length > 0 ? state.boards[0].id : null;
            }
            saveState();
            renderApp();
        }
    }

    // List Operations
    function addList() {
        const board = getActiveBoard();
        if (!board) return;
        
        showInputModal({
            title: 'Add New List',
            label: 'List Name',
            placeholder: 'e.g., To Do',
            buttonText: 'Add List',
            onSave: (name) => {
                const newList = { id: generateId('list'), name, cards: [] };
                board.lists.push(newList);
                saveState();
                renderBoard();
            }
        });
    }
    
    function editListTitle(listId, currentName) {
        showInputModal({
            title: 'Edit List Name',
            label: 'New List Name',
            placeholder: 'e.g., In Progress',
            initialValue: currentName,
            buttonText: 'Save Changes',
            onSave: (newName) => {
                const board = getActiveBoard();
                const list = board.lists.find(l => l.id === listId);
                list.name = newName;
                saveState();
                renderBoard();
            }
        });
    }

    function deleteList(listId) {
        if (confirm('Are you sure you want to delete this list?')) {
            const board = getActiveBoard();
            board.lists = board.lists.filter(l => l.id !== listId);
            saveState();
            renderBoard();
        }
    }
    
    // Card Operations
    function addCard(listId) {
        showInputModal({
            title: 'Add New Card',
            label: 'Card Title',
            placeholder: 'e.g., Design the homepage mockup',
            buttonText: 'Add Card',
            onSave: (title) => {
                 const newCard = {
                    id: generateId('card'),
                    title,
                    description: '',
                    labels: [],
                    dueDate: null
                };
                const board = getActiveBoard();
                const list = board.lists.find(l => l.id === listId);
                list.cards.push(newCard);
                saveState();
                renderBoard();
            }
        });
    }

    function editCard(cardId, listId) {
        const board = getActiveBoard();
        const list = board.lists.find(l => l.id === listId);
        const card = list.cards.find(c => c.id === cardId);

        const content = `
            <div class="form-group">
                <label for="cardTitle">Title</label>
                <input type="text" id="cardTitle" value="${card.title}">
            </div>
            <div class="form-group">
                <label for="cardDesc">Description</label>
                <textarea id="cardDesc">${card.description}</textarea>
            </div>
            <div class="form-group">
                <label for="cardDueDate">Due Date</label>
                <input type="date" id="cardDueDate" value="${card.dueDate ? card.dueDate.split('T')[0] : ''}">
            </div>
            <div class="form-group">
                <label>Labels (comma-separated, e.g., Urgent,Work)</label>
                <input type="text" id="cardLabels" value="${card.labels.map(l => l.text).join(',')}">
            </div>
            <div class="modal-actions">
                <button id="deleteCardBtn" class="btn btn-danger">Delete Card</button>
                <button id="saveCardBtn" class="btn btn-primary">Save Changes</button>
            </div>
        `;
        showModal('Edit Card', content);

        document.getElementById('saveCardBtn').onclick = () => {
            card.title = document.getElementById('cardTitle').value.trim();
            card.description = document.getElementById('cardDesc').value.trim();
            card.dueDate = document.getElementById('cardDueDate').value;
            const labelsText = document.getElementById('cardLabels').value.trim();
            card.labels = labelsText ? labelsText.split(',').map(text => ({ text: text.trim(), color: '#7289da' })) : [];
            
            saveState();
            renderBoard();
            hideModal();
        };

        document.getElementById('deleteCardBtn').onclick = () => {
            deleteCard(cardId, listId);
            hideModal();
        };
    }

    function deleteCard(cardId, listId) {
        const board = getActiveBoard();
        const list = board.lists.find(l => l.id === listId);
        list.cards = list.cards.filter(c => c.id !== cardId);
        saveState();
        renderBoard();
    }


    // --- GLOBAL EVENT LISTENERS (ATTACHED ONCE) --- //
    
    function bindGlobalEventListeners() {
        // Search functionality
        searchInput.addEventListener('input', renderBoard);

        // Modal closing
        closeModalBtn.addEventListener('click', hideModal);
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) hideModal();
        });

        // Static buttons
        addBoardBtnSidebar.addEventListener('click', addBoard);
        addListBtn.addEventListener('click', addList);

        // Click delegation for dynamic elements
        document.body.addEventListener('click', (e) => {
            const boardLi = e.target.closest('li[data-board-id]');
            if (boardLi && !e.target.closest('.board-actions')) {
                state.activeBoardId = boardLi.dataset.boardId;
                saveState();
                renderApp();
                return;
            }

            if (e.target.closest('.edit-board-btn')) {
                editBoard(e.target.closest('li[data-board-id]').dataset.boardId);
            } else if (e.target.closest('.delete-board-btn')) {
                deleteBoard(e.target.closest('li[data-board-id]').dataset.boardId);
            } else if (e.target.closest('.list-title')) {
                const listEl = e.target.closest('.list');
                editListTitle(listEl.dataset.listId, e.target.textContent);
            } else if (e.target.closest('.delete-list-btn')) {
                deleteList(e.target.closest('.list').dataset.listId);
            // --- FIX: RESTORED THIS BLOCK ---
            } else if (e.target.closest('.add-card-btn')) {
                addCard(e.target.closest('.list').dataset.listId);
            // --- END FIX ---
            } else if (e.target.closest('.card')) {
                const cardEl = e.target.closest('.card');
                const listEl = e.target.closest('.list');
                editCard(cardEl.dataset.cardId, listEl.dataset.listId);
            }
        });

        // Drag and Drop
        document.body.addEventListener('dragstart', (e) => {
            if (e.target.matches('.card')) {
                e.target.classList.add('dragging');
                state.draggedElement = {
                    type: 'card',
                    id: e.target.dataset.cardId,
                    sourceListId: e.target.closest('.list').dataset.listId
                };
            } else if (e.target.matches('.list')) {
                e.target.classList.add('dragging');
                state.draggedElement = { type: 'list', id: e.target.dataset.listId };
            }
        });

        document.body.addEventListener('dragend', (e) => {
            if (e.target.matches('.card') || e.target.matches('.list')) {
                e.target.classList.remove('dragging');
                state.draggedElement = null;
                renderBoard(); // Clean up visual artifacts
            }
        });

        document.body.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.body.addEventListener('drop', (e) => {
            e.preventDefault();
            if (!state.draggedElement) return;

            const board = getActiveBoard();
            
            if (state.draggedElement.type === 'card') {
                const targetListEl = e.target.closest('.list');
                if (!targetListEl) return;
                
                const sourceList = board.lists.find(l => l.id === state.draggedElement.sourceListId);
                const targetList = board.lists.find(l => l.id === targetListEl.dataset.listId);
                const cardIndex = sourceList.cards.findIndex(c => c.id === state.draggedElement.id);
                const [card] = sourceList.cards.splice(cardIndex, 1);
                
                const targetCardEl = e.target.closest('.card');
                if (targetCardEl) {
                    const targetCardIndex = targetList.cards.findIndex(c => c.id === targetCardEl.dataset.cardId);
                    targetList.cards.splice(targetCardIndex, 0, card);
                } else {
                    targetList.cards.push(card);
                }

            } else if (state.draggedElement.type === 'list') {
                const targetListEl = e.target.closest('.list');
                if (targetListEl && targetListEl.dataset.listId !== state.draggedElement.id) {
                     const draggedListIndex = board.lists.findIndex(l => l.id === state.draggedElement.id);
                     const [draggedList] = board.lists.splice(draggedListIndex, 1);
                     const targetListIndex = board.lists.findIndex(l => l.id === targetListEl.dataset.listId);
                     board.lists.splice(targetListIndex, 0, draggedList);
                }
            }

            saveState();
            renderBoard();
        });
    }

    // --- INITIALIZATION --- //
    function init() {
        loadState();
        renderApp();
        bindGlobalEventListeners();
    }

    init();
});
