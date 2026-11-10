const app = document.querySelector("#app");
const homePage = {
  image: "Acceuil_global.png",
  imageAlt: "Un livre ouvert dans une forêt magique, sous le titre Comptes enchantés",
  buttonLabel: "Paladin Orion et le cristal volé",
  target: "0_Acceuil",
};

function showError(message) {
  const notice = document.createElement("p");
  notice.className = "status status-error";
  notice.setAttribute("role", "alert");
  notice.textContent = message;
  app.replaceChildren(notice);
}

function makeChoice(label, pageId) {
  const link = document.createElement("a");
  link.className = "choice-button";
  link.href = `?page=${encodeURIComponent(pageId)}`;
  link.textContent = label;
  return link;
}

function appendInlineMarkdown(text, parent) {
  const tokens = text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`)/g);
  for (const token of tokens) {
    let element;
    let content;
    if (token.startsWith("**") || token.startsWith("__")) {
      element = document.createElement("strong");
      content = token.slice(2, -2);
    } else if (token.startsWith("*") || token.startsWith("_")) {
      element = document.createElement("em");
      content = token.slice(1, -1);
    } else if (token.startsWith("`")) {
      element = document.createElement("code");
      content = token.slice(1, -1);
    }

    if (element) {
      element.textContent = content;
      parent.append(element);
    } else {
      parent.append(document.createTextNode(token));
    }
  }
}

function renderMarkdown(markdown, container) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) {
      const element = document.createElement(`h${heading[1].length}`);
      appendInlineMarkdown(heading[2], element);
      container.append(element);
      index += 1;
      continue;
    }

    const listItem = line.match(/^\s*([-*+]|\d+[.)])\s+(.+)$/);
    if (listItem) {
      const isOrdered = /^\d/.test(listItem[1]);
      const list = document.createElement(isOrdered ? "ol" : "ul");
      while (index < lines.length) {
        const item = lines[index].match(/^\s*([-*+]|\d+[.)])\s+(.+)$/);
        if (!item || /^\d/.test(item[1]) !== isOrdered) {
          break;
        }
        const element = document.createElement("li");
        appendInlineMarkdown(item[2], element);
        list.append(element);
        index += 1;
      }
      container.append(list);
      continue;
    }

    const paragraphLines = [];
    while (index < lines.length && lines[index].trim()) {
      if (paragraphLines.length && (/^(#{1,6})\s+/.test(lines[index])
        || /^\s*([-*+]|\d+[.)])\s+/.test(lines[index]))) {
        break;
      }
      paragraphLines.push(lines[index]);
      index += 1;
    }
    const paragraph = document.createElement("p");
    appendInlineMarkdown(paragraphLines.join(" "), paragraph);
    container.append(paragraph);
  }
}

function renderHome() {
  const image = document.createElement("img");
  image.className = "page-image home-image";
  image.src = homePage.image;
  image.alt = homePage.imageAlt;

  const heading = document.createElement("h1");
  heading.className = "sr-only";
  heading.textContent = "Comptes enchantés";

  const button = makeChoice(homePage.buttonLabel, homePage.target);
  button.classList.add("home-button");

  app.replaceChildren(heading, image, button);
}

async function renderStoryPage(pageId) {
  let pages;
  try {
    const response = await fetch("1_DND/histoire.json");
    if (!response.ok) {
      throw new Error(`Impossible de charger le fichier de l’histoire (${response.status}).`);
    }
    pages = await response.json();
  } catch (error) {
    console.error("Chargement de l’histoire impossible.", error);
    showError("L’histoire n’a pas pu être chargée. Réessaie dans un instant.");
    return;
  }

  const page = Object.hasOwn(pages, pageId) ? pages[pageId] : undefined;
  if (!page) {
    showError("Cette page de l’histoire n’existe pas.");
    return;
  }

  const heading = document.createElement("h1");
  heading.className = "page-title";
  heading.textContent = page.title;

  const image = document.createElement("img");
  image.className = "page-image";
  image.src = page.image;
  image.alt = page.imageAlt;

  const textHeading = document.createElement("h2");
  textHeading.className = "story-heading";
  textHeading.textContent = "L’histoire";

  const storyText = document.createElement("div");
  storyText.className = "story-text";
  storyText.setAttribute("aria-live", "polite");

  const content = document.createElement("section");
  content.className = "story-content";
  content.setAttribute("aria-label", "Suite de l’histoire");
  content.append(textHeading, storyText);

  const choices = document.createElement("nav");
  choices.className = "choice-list";
  choices.setAttribute("aria-label", "Choisir la suite de l’histoire");
  for (const choice of page.choices) {
    choices.append(makeChoice(choice.label, choice.page));
  }

  app.replaceChildren(heading, image, content, choices);

  try {
    const response = await fetch(page.text);
    if (!response.ok) {
      throw new Error(`Impossible de charger le texte (${response.status}).`);
    }
    renderMarkdown(await response.text(), storyText);
  } catch (error) {
    console.error(`Chargement du texte « ${page.title} » impossible.`, error);
    storyText.textContent = "Le texte de cette page n’a pas pu être chargé.";
    storyText.classList.add("status-error");
  }
}

const pageId = new URLSearchParams(window.location.search).get("page");
if (pageId) {
  renderStoryPage(pageId);
} else {
  renderHome();
}
