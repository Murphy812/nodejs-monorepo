import { Component, Input } from '@angular/core';
import { DetailsData, DetailsPage } from "../pages/details";
import { ModalController } from "ionic-angular";
import { ViewQrCodePage } from "../pages/view-qrcode";
import { QrCodeScanService } from "../services/qrcode-scan.service";
import { DataService } from "../services/data.service";

@Component({
  selector: 'quick-actions',
  templateUrl: 'quick-actions.html'
})
export class QuickActions {
  constructor(private _modalController: ModalController,
    private _qrCodeScanService: QrCodeScanService,
    private _dataService: DataService) { }

  public onBarcode() {
    this._qrCodeScanService.scanQRCode();
  }

  public onRefresh() {

  }

  public onId() {
    let accessModal = this._modalController.create(ViewQrCodePage,
      { value: `character:${this._dataService.getUsername()}` });
    accessModal.present();
  }
}
