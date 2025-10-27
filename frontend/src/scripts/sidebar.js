import template from "@/templates/sidebar.html?raw";

export class Sidebar {
  constructor(container) {
    this.container = container;
    this.render();
  }

  render() {
    this.container.innerHTML = template;
    this.setActiveItem();
  }

  setActiveItem() {
    const navItems = this.container.querySelectorAll(".sidebar-nav-item");
    const currentPage = window.location.pathname;

    navItems.forEach((item) => {
      const itemHref = item.getAttribute("href");

      if (itemHref === currentPage) {
        item.classList.add("sidebar-nav-item-active");
      }
    });
  }
}
