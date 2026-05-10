@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #14181c;
  --bg-secondary: #1c2228;
  --bg-card: #242c34;
  --text-primary: #ffffff;
  --text-secondary: #9ab;
  --accent-green: #00c030;
  --accent-orange: #ff8000;
  --accent-blue: #40bcf4;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
