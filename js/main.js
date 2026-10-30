(() => {
  "use strict";

  const config = window.PORTFOLIO_CONFIG || {};
  const localProjects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
  const grid = document.getElementById("project-grid");
  const filterContainer = document.getElementById("project-filters");
  const dialog = document.getElementById("project-dialog");
  const dialogMedia = document.getElementById("dialog-media");
  const menuToggle = document.getElementById("menu-toggle");
  const mainNav = document.getElementById("main-nav");
  let allProjects = [...localProjects];
  let activeFilter = "all";

  const categoryNames = {
    editing: "VIDEO EDITING",
    cinematography: "CINEMATOGRAPHY",
    "graphic-design": "GRAPHIC DESIGN",
    photography: "PHOTOGRAPHY"
  };

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function getYouTubeEmbedUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(value);
      const host = url.hostname.replace(/^www\./, "");
      let id = "";
      if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] || "";
      if (host === "youtube.com" || host === "m.youtube.com") {
        if (url.pathname === "/watch") id = url.searchParams.get("v") || "";
        if (url.pathname.startsWith("/embed/")) id = url.pathname.split("/")[2] || "";
        if (url.pathname.startsWith("/shorts/")) id = url.pathname.split("/")[2] || "";
      }
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return "";
      return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
    } catch (_) {
      return "";
    }
  }

  function createProjectCard(project) {
    const card = makeElement("article", "project-card");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Preview ${project.title || "project"}`);

    const thumb = makeElement("div", "project-thumb");
    const image = document.createElement("img");
    image.src = project.thumbnailUrl || "assets/images/project-fallback.svg";
    image.alt = `${project.title || "Project"} thumbnail`;
    image.loading = "lazy";
    image.onerror = () => { image.src = "assets/images/project-fallback.svg"; };
    thumb.appendChild(image);
    thumb.appendChild(makeElement("div", "thumb-overlay"));
    thumb.appendChild(makeElement("span", "play-mark", project.mediaType === "video" ? "▶" : "↗"));

    const meta = makeElement("div", "project-meta");
    meta.appendChild(makeElement("h3", "", project.title || "Untitled project"));
    meta.appendChild(makeElement("span", "project-category", project.categoryLabel || categoryNames[project.category] || "PROJECT"));

    const subline = [project.client, project.year].filter(Boolean).join(" · ");
    const sub = makeElement("p", "project-subtitle", subline);
    card.append(thumb, meta, sub);

    card.addEventListener("click", () => openProject(project));
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProject(project);
      }
    });
    return card;
  }

  function renderProjects() {
    if (!grid) return;
    grid.replaceChildren();
    const visibleProjects = allProjects.filter(project => activeFilter === "all" || project.category === activeFilter);
    if (!visibleProjects.length) {
      grid.appendChild(makeElement("p", "empty-message", "No projects in this category yet. Add work in js/projects.js or your Supabase table."));
      return;
    }
    visibleProjects.forEach(project => grid.appendChild(createProjectCard(project)));
  }

  function showPreviewMessage(message) {
    dialogMedia.replaceChildren(makeElement("p", "dialog-placeholder", message));
  }

  function openProject(project) {
    if (!dialog || !dialogMedia) return;
    dialogMedia.replaceChildren();
    const mediaUrl = project.mediaUrl || project.media_url || "";
    const mediaType = project.mediaType || project.media_type || "video";
    const thumbnail = project.thumbnailUrl || project.thumbnail_url || "assets/images/project-fallback.svg";

    if (mediaType === "video") {
      const embedUrl = getYouTubeEmbedUrl(mediaUrl);
      if (embedUrl) {
        const iframe = document.createElement("iframe");
        iframe.src = embedUrl;
        iframe.title = project.title || "Portfolio video";
        iframe.loading = "lazy";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allowFullscreen = true;
        dialogMedia.appendChild(iframe);
      } else {
        showPreviewMessage("Add your YouTube video URL to this project in js/projects.js, or add a media_url in your Supabase project record. Use the standard YouTube watch link or youtu.be link.");
      }
    } else {
      const imageUrl = mediaUrl || thumbnail;
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = project.title || "Portfolio image";
      image.onerror = () => showPreviewMessage("This image could not be loaded. Check the media URL for this project.");
      dialogMedia.appendChild(image);
    }

    document.getElementById("dialog-category").textContent = project.categoryLabel || categoryNames[project.category] || String(project.category || "PROJECT").toUpperCase();
    document.getElementById("dialog-title").textContent = project.title || "Untitled project";
    document.getElementById("dialog-description").textContent = project.description || "";
    dialog.showModal();
  }

  async function loadFromSupabase() {
    const hasCredentials = Boolean(config.supabaseUrl && config.supabasePublishableKey);
    if (!hasCredentials || !window.supabase || typeof window.supabase.createClient !== "function") return localProjects;

    try {
      const client = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey);
      const { data, error } = await client
        .from("portfolio_projects")
        .select("id,title,category,description,thumbnail_url,media_url,media_type,client_name,year,featured,sort_order")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      if (!Array.isArray(data) || data.length === 0) return localProjects;

      return data.map(row => ({
        ...row,
        thumbnailUrl: row.thumbnail_url,
        mediaUrl: row.media_url,
        mediaType: row.media_type,
        client: row.client_name,
        categoryLabel: categoryNames[row.category] || String(row.category || "PROJECT").toUpperCase()
      }));
    } catch (error) {
      console.error("Supabase project load failed. Showing local starter projects instead.", error);
      return localProjects;
    }
  }

  function setupFilters() {
    if (!filterContainer) return;
    filterContainer.addEventListener("click", event => {
      const button = event.target.closest("button[data-filter]");
      if (!button) return;
      activeFilter = button.dataset.filter;
      filterContainer.querySelectorAll(".filter-btn").forEach(item => {
        item.classList.toggle("active", item === button);
        item.removeAttribute("aria-pressed");
        if (item === button) item.setAttribute("aria-pressed", "true");
      });
      renderProjects();
    });
  }

  function setupNavigation() {
    if (!menuToggle || !mainNav) return;
    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
    mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }));
  }

  function setupContactDetails() {
    const email = document.getElementById("contact-email");
    if (email && config.contactEmail) {
      email.textContent = `${config.contactEmail} ↗`;
      email.href = `mailto:${config.contactEmail}`;
    }
    const social = document.getElementById("social-links");
    if (social) {
      const links = [
        ["INSTAGRAM ↗", config.instagramUrl],
        ["YOUTUBE ↗", config.youtubeUrl],
        ["LINKEDIN ↗", config.linkedinUrl]
      ];
      social.replaceChildren();
      links.filter(([, url]) => url).forEach(([label, url]) => {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = label;
        social.appendChild(anchor);
      });
    }
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function setupDialog() {
    const close = document.getElementById("dialog-close");
    if (close && dialog) close.addEventListener("click", () => dialog.close());
    if (dialog) {
      dialog.addEventListener("click", event => {
        if (event.target === dialog) dialog.close();
      });
      dialog.addEventListener("close", () => dialogMedia.replaceChildren());
    }
  }

  async function init() {
    setupFilters();
    setupNavigation();
    setupContactDetails();
    setupDialog();
    allProjects = await loadFromSupabase();
    renderProjects();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
