"use strict";
import { LitElement, html } from "@polymer/lit-element";
import "@polymer/paper-button";
import "@polymer/paper-dialog/paper-dialog.js";
import "@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js";
import "@01ht/ht-storage";

class HTOrganizationEditorImage extends LitElement {
  _render({ data }) {
    return html`
      <style>
        :host {
          display: block;
          position:relative;
          box-sizing:border-box;
        }

        #select {
          color:var(--accent-color);
        }

        paper-button {
            margin:8px 0 0 0;
            color:var(--secondary-text-color);
            font-weight:500;
            padding: 8px 16px;
        }
        
        paper-dialog {
            width: 95%;
            max-width: 800px;
            margin-left: 0;
            margin-right: 0;
        }

        img {
            display:block;
            width: 100%;
            height: 100%;
            max-width: 128px;
        }

        #actions {
            display:flex;
            flex-wrap:wrap;
        }

        #choose {
            margin-right:8px;
            color: #fff;
            background: var(--accent-color);
        }

        #img-container {
          margin-top: 16px;
          position:relative;
        }

        .buttons {
          padding:8px 24px 16px 24px;
        }

        [hidden] {
            display: none;
        }
      </style>
      <div id="container"> 
        <p>512x512 | .jpg</p>
        <div id="actions">
            <paper-button id="choose" on-click=${e => {
              this._showDialog();
            }}" raised>
                Выбрать</paper-button>
        </div>
        ${
          data.public_id
            ? html`<div id="img-container"><img src="${
                window.cloudinaryURL
              }/image/upload/c_scale,f_auto,w_512/v${data.version}/${
                data.public_id
              }.jpg">
                </div>`
            : ""
        }
        <paper-dialog>
            <h2>Выберите изображение</h2>
            <paper-dialog-scrollable>
                <ht-storage></ht-storage>
            </paper-dialog-scrollable>
            <div class="buttons">
            <paper-button id="close" dialog-dismiss>Закрыть</paper-button>
            <paper-button id="select" dialog-confirm on-click="${e => {
              this._insertImage();
            }}">Выбрать</paper-button>
            </div>
        </paper-dialog>

      </div>
`;
  }

  static get is() {
    return "ht-organization-editor-image";
  }

  static get properties() {
    return { data: Object };
  }

  constructor() {
    super();
    this.data = {};
  }

  get dialog() {
    return this.shadowRoot.querySelector("paper-dialog");
  }

  get storage() {
    return this.shadowRoot.querySelector("ht-storage");
  }

  _showDialog() {
    this.dialog.open();
    this.storage.updateList();
  }

  _insertImage() {
    let items = this.storage.getSelectedItems();
    if (items.length === 0) return;
    let item = items[0];
    if (item.format === "jpg" && item.width === 512 && item.height === 512) {
      this.data = item;
    } else {
      this.dispatchEvent(
        new CustomEvent("show-toast", {
          bubbles: true,
          composed: true,
          detail: {
            text: "Изображение не соотвествует требованиям"
          }
        })
      );
    }
  }

  reset() {
    this.data = {};
  }
}

customElements.define(HTOrganizationEditorImage.is, HTOrganizationEditorImage);
