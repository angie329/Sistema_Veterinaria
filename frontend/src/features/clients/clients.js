import "./styles/clients.css";
import { icons } from "lucide";

import { BaseApp } from "@/base-app.js";
import template from "./templates/index.html?raw";

export class ClientsApp extends BaseApp {
  constructor() {
    super();
  }

  async loadFeature() {
    const mainContentEl = this.getMainContent();
    if (mainContentEl) {
      this.container = mainContentEl;
      this.render();
    }
  }

  render() {
    this.container.innerHTML = template;
  }

  registerIcons() {
    return {
      PlusCircle: icons.PlusCircle,
    };
  }
}
