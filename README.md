# One-Page Websites Portfolio

A GitHub Pages portfolio to showcase your collection of fun and interesting one-page websites.

## 🚀 Live Demo

Visit your portfolio at: `https://[your-username].github.io/1page`

## 📁 Project Structure

```
1page/
├── index.html          # Main portfolio page  
├── styles.css          # Styling for the portfolio
├── calculator/         # Calculator app
│   └── index.html      # Access: yoursite.com/1page/calculator
├── weather/            # Weather dashboard  
│   └── index.html      # Access: yoursite.com/1page/weather
├── todo/               # Todo list app
│   └── index.html      # Access: yoursite.com/1page/todo
└── ...                 # More user-friendly named projects
```

## 🛠️ Setup Instructions

1. **Initialize Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio setup"
   ```

2. **Create GitHub Repository**
   - Go to GitHub and create a new repository named `1page`
   - Push your local repository to GitHub:
   ```bash
   git remote add origin https://github.com/[your-username]/1page.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository settings
   - Scroll down to "Pages" section
   - Select "Deploy from a branch" as source
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

## 📝 Adding New Projects

### 🎯 User-Friendly URLs
Each project gets a clean, memorable URL:
- `yoursite.com/1page/calculator` ✅
- `yoursite.com/1page/weather` ✅  
- `yoursite.com/1page/game` ✅

### 📋 Steps to Add a Project:

1. **Create folder with descriptive name** (e.g., `snake-game/`, `portfolio/`, `music-player/`)
2. **Add your files** - Put `index.html` and assets in the folder
3. **Update main portfolio** - Add project card to `index.html`:

```html
<div class="project-card">
    <div class="project-preview">
        <iframe src="./snake-game" title="Snake Game"></iframe>
    </div>
    <div class="project-info">
        <h3>Snake Game</h3>
        <p>Classic snake game with modern twist</p>
        <div class="project-links">
            <a href="./snake-game" class="btn btn-primary" target="_blank">View Live</a>
            <a href="https://github.com/[username]/1page/tree/main/snake-game" class="btn btn-secondary" target="_blank">Source</a>
        </div>
        <div class="project-tags">
            <span class="tag">Game</span>
            <span class="tag">Canvas</span>
            <span class="tag">JavaScript</span>
        </div>
    </div>
</div>
```

### 💡 Naming Tips:
- Use lowercase, hyphen-separated names
- Keep URLs short and memorable  
- Make them descriptive: `weather`, `calculator`, `todo`

## 🎨 Customization

- **Colors**: Modify the CSS variables in `styles.css` to change the color scheme
- **Layout**: Adjust the grid layout in `.portfolio-grid` class
- **Animations**: Customize the fade-in animations and hover effects

## 📱 Features

- ✅ Responsive design that works on all devices
- ✅ Interactive project previews using iframes
- ✅ Smooth hover animations and transitions
- ✅ Easy to add new projects
- ✅ Clean, modern design
- ✅ GitHub Pages ready

## 🤝 Contributing

Feel free to fork this repository and customize it for your own use!

---

Made with ❤️ for showcasing one-page websites