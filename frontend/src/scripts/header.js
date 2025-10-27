import template from "@/templates/header.html?raw";

export class Header {
  constructor(container) {
    this.container = container;
    this.render();
  }

  render() {
    this.container.innerHTML = template;
  }
}
