import { NgModule } from "@angular/core";
import { DropzoneDirective } from "./directive/dropzone.directive";

@NgModule({
    exports: [DropzoneDirective],
    declarations: [DropzoneDirective]
  })
  export class SharedModule {}