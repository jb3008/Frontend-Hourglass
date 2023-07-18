import { DrawerComponent, MenuComponent, ScrollComponent, ToggleComponent } from "./components";

const menuReinitialization = () => {
  setTimeout(() => {
    console.log('menuReinitialization')
    MenuComponent.reinitialization();
    DrawerComponent.reinitialization();
    ToggleComponent.reinitialization();
    ScrollComponent.reinitialization();
  }, 50);
}

export { menuReinitialization }
