# My promo page

## How to see this project online

<h5>You can check my promo page here: <a href="https://ashmee.github.io" target="_blank">ashmee.github.io</a>.</h5> 

## How To Build
You must have installed: `node`, `npm`, `gulp`. (Global dependencies).

To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
 git clone https://github.com/ashmee/ashmee.github.io.git

# Go into the repository
 cd ashmee.github.io

# Install dependencies and autostart Dev version
 npm i
```
---
For <b>Prod</b> version: 
`npm run build`
... or
 `gulp prod` 
 
Then you may open index.html file from /build/ directory

---

Note: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.


## Project structure

* `build/` build directory 
* `src/` 
    - `font/`
    - `styles/`
      - `main.css` entry-point styles 
    - `images/` graphic files(png, svg)
    - `scripts/`
      - `main.js` entry-point JS files 
    - `index.html` entry-point html 
* `.eslintrc.json` eslint rules
* `.stylelintrc.json` stylilint rules
