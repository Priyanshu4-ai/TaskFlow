# TaskFlow
A modern, offline-first, Trello-like task management app built entirely with HTML, CSS, and vanilla JavaScript.
TaskFlow is a lightweight and fully functional Kanban board application that runs completely in your web browser. It uses LocalStorage to save all your data, meaning your boards, lists, and tasks persist between sessions without needing a server or an internet connection.

ScreenShots:


✨ Key Features
🗂️ Board Management: Create, edit, and delete multiple boards to separate your projects or workflows.

📋 Customizable Lists: Add, rename, reorder (drag-and-drop), and delete lists (columns) within any board.

📝 Rich Task Cards: Create, edit, and delete tasks (cards) with support for:

Title and detailed description.

Due dates.

Customizable labels.

🖱️ Drag & Drop: Intuitively move cards between lists and reorder lists themselves.

💾 Persistent Local Storage: All changes are automatically saved to your browser's LocalStorage. Your data remains even after closing the tab or browser.

⚡ Offline First: The application is 100% client-side and works perfectly offline.

🔍 Real-time Search: Instantly filter cards across the current board by title or description.

📱 Responsive Design: A clean, modern UI that adapts seamlessly to both desktop and mobile screens.

🎨 Dark Theme: A visually appealing dark theme with vibrant accent colors.

🛠️ Tech Stack
HTML5: For the core structure and content.

CSS3: For all styling, including the dark theme, responsive layout, and animations.

Vanilla JavaScript (ES6+): For all application logic, state management, DOM manipulation, and event handling.

Font Awesome: For modern, scalable icons.

No frameworks, no libraries, no build tools required. Just pure web technologies.

🚀 How to Run
Running TaskFlow is simple. No installation or web server is needed.

Download the Files: Make sure you have the three essential files in the same folder:

index.html

style.css

script.js

Open in Browser: Simply open the index.html file in any modern web browser (like Google Chrome, Mozilla Firefox, or Microsoft Edge).

Start Organizing: The application will launch, create a "Welcome Board" for you, and you can start creating your own boards, lists, and tasks immediately.
How It Works
The application follows a simple, state-driven model without any external frameworks.

script.js - The Application Brain
State Management: A single JavaScript object named state holds the entire application's data (all boards, lists, and cards, plus the active board ID).

LocalStorage Persistence: The saveState() function serializes the state object into a JSON string and saves it to LocalStorage. The loadState() function retrieves and parses this data when the app starts.

Rendering Engine: A set of render() functions (renderApp, renderSidebar, renderBoard) are responsible for generating HTML from the state object and updating the DOM. The app is re-rendered whenever the state changes.

Event Handling: A single bindGlobalEventListeners function uses event delegation to manage all user interactions (clicks, drag-and-drop, form submissions) efficiently. This avoids attaching multiple listeners to dynamic elements.

Modals: A custom modal system is used for all forms (creating/editing boards, lists, and cards) to provide a consistent UI instead of relying on native browser prompts.

index.html - The Skeleton
This file provides the basic page layout, including containers for the sidebar, top navigation, main board view, and a hidden modal element. All dynamic content is injected into these containers by script.js.

style.css - The Look & Feel
This file contains all visual rules. It uses modern CSS features like Flexbox for layout, CSS Variables for easy theming (e.g., colors, fonts), and transitions for smooth animations. It also includes @media queries to ensure the layout is responsive.
