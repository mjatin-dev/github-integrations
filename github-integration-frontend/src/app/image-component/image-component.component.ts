import { Component } from "@angular/core";

import type { ICellRendererAngularComp } from "ag-grid-angular";
import type { ICellRendererParams } from "ag-grid-community";

@Component({
  standalone: true,
  template: `<img alt="{{ params.data.country }}" src="{{ params?.value }}" />`,
  styles: [
    `
      img {
        width: 50px;
        height: 50px;
        padding: 10px;
        object-fit: cover;
      }
    `,
  ],
})
export class ImageCellRenderer implements ICellRendererAngularComp {
  public params!: any;

  agInit(params: ICellRendererParams<any>): void {
    this.params = params;
    console.log("ImageCellRenderer.agInit", this.params);
  }

  refresh() {
    return false;
  }
}
