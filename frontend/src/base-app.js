import { createIcons, icons } from "lucide";

import { Header } from "./scripts/header.js";
import { Sidebar } from "./scripts/sidebar.js";

export class BaseApp {
  constructor() {
    if (this.constructor === BaseApp) {
      throw new Error(
        "BaseApp cannot be instantiated directly. It must be inherited."
      );
    }
    this.app = document.getElementById("app");
    this.init();
  }

  async init() {
    this.createSidebar();
    this.createHeader();
    this.createMainContainer();
    await this.loadFeature();
    this.initIcons();
  }

  createSidebar() {
    const sidebarContainer = document.createElement("div");
    this.sidebar = new Sidebar(sidebarContainer);
    this.app.appendChild(sidebarContainer.firstElementChild);
  }

  createHeader() {
    const headerContainer = document.createElement("div");
    this.header = new Header(headerContainer);
    this.app.appendChild(headerContainer.firstElementChild);
  }

  createMainContainer() {
    const mainContainer = document.createElement("div");
    mainContainer.className = "content";
    mainContainer.innerHTML = "<main id='mainContent'></main>";
    this.app.appendChild(mainContainer);
  }

  // Abstract method to be implemented by each subclass
  async loadFeature() {}

  initIcons() {
    const baseIcons = {
      LayoutDashboard: icons.LayoutDashboard,
      Users: icons.Users,
      Dog: icons.Dog,
      Stethoscope: icons.Stethoscope,
      Calendar: icons.Calendar,
      Package: icons.Package,
      Receipt: icons.Receipt,
      Settings: icons.Settings,
      Menu: icons.Menu,
      Search: icons.Search,
      Bell: icons.Bell,
      ChevronDown: icons.ChevronDown,
    };

    const featureIcons = this.registerIcons();

    createIcons({
      icons: { ...baseIcons, ...featureIcons },
    });
  }

  registerIcons() {
    return {};
  }

  getMainContent() {
    return document.getElementById("mainContent");
  }
}
