import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="profile-table">
      <div class="table-container">
        <table *ngIf="rows && rows.length > 0">
          <colgroup>
            <col *ngFor="let c of columns" />
            <col class="col-actions" *ngIf="actionsTemplate" />
          </colgroup>
          <thead>
            <tr>
              <th *ngFor="let h of columns">{{ h }}</th>
              <th *ngIf="actionsTemplate">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of rows">
              <td *ngFor="let _col of columns; let i = index">
                <ng-container *ngIf="keys && keys[i]; else noKey">
                  <ng-container *ngIf="cellTemplates && cellTemplates[keys[i]]; else textVal">
                    <ng-container *ngTemplateOutlet="cellTemplates[keys[i]]; context: { $implicit: row }"></ng-container>
                  </ng-container>
                  <ng-template #textVal>{{ getCellValue(row, keys[i]) }}</ng-template>
                </ng-container>
                <ng-template #noKey>
                  <ng-container *ngIf="cellTemplates && cellTemplates[columns[i]]; else textVal2">
                    <ng-container *ngTemplateOutlet="cellTemplates[columns[i]]; context: { $implicit: row }"></ng-container>
                  </ng-container>
                  <ng-template #textVal2>{{ getCellValue(row, columns[i]) }}</ng-template>
                </ng-template>
              </td>
              <td *ngIf="actionsTemplate" class="actions">
                <ng-container
                  *ngTemplateOutlet="actionsTemplate; context: { $implicit: row }"
                ></ng-container>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!rows || rows.length === 0" class="empty">No hay datos.</div>
      </div>
    </section>
  `,
  styleUrls: ['./profile-table.css'],
})
export class ProfileTableComponent {
  @Input() columns: string[] = [];
  @Input() rows: any[] = [];
  @Input() keys?: string[];
  @Input() actionsTemplate?: TemplateRef<any> | null = null;
  @Input() cellTemplates?: { [key: string]: TemplateRef<any> } | null = null;

  getCellValue(row: any, keyOrLabel: string): any {
    if (!row) return '';
    if (typeof keyOrLabel === 'string') {
      if (keyOrLabel in row) return row[keyOrLabel];
      if (keyOrLabel.indexOf('.') !== -1) {
        try {
          return keyOrLabel
            .split('.')
            .reduce((acc: any, k: string) => (acc ? acc[k] : undefined), row);
        } catch (e) {
          return '';
        }
      }
    }
    if (row.name) return row.name;
    if (row.title) return row.title;
    if (row.id) return row.id;
    return JSON.stringify(row);
  }
}
