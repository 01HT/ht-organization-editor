"use strict";
import { LitElement, html } from "@polymer/lit-element";
import "@polymer/paper-input/paper-input.js";
import "@01ht/ht-wysiwyg";
import "@01ht/ht-spinner";
import "./ht-organization-editor-image.js";
class HTItemEditor extends LitElement {
  _render({ orgId, loading, loadingText }) {
    return html`
      <style>
        :host {
          display: block;
          position:relative;
          box-sizing:border-box;
        }

        paper-button {
          background: var(--accent-color);
          margin:0;
          color: #fff;
          padding: 8px 16px;
        }

        section {
          margin-top:32px;
        }

        paper-input {
          max-width: 500px;
        }

        #actions {
          display: flex;
          justify-content: flex-end;
          margin-top:32px;
        }

        #container[hidden], ht-spinner[hidden] {
          display:none;
        }
      </style>
      <ht-spinner page text$=${loadingText} hidden?=${!loading}></ht-spinner>
      <div id="container" hidden?=${loading}>
        <h1>${
          orgId === "" ? "Добавить организацию" : "Настройки организации"
        }</h1>
        <paper-input id="displayName" label="Название"></paper-input>
        <paper-input id="country" label="Страна"></paper-input>
        <paper-input id="city" label="Город" auto-validate></paper-input>
        <paper-input id="phone" label="Телефон"></paper-input>
        <paper-input id="website" label="Ваш сайт"></paper-input>
        <paper-input id="google" label="Google+"></paper-input>
        <paper-input id="facebook" label="Facebook"></paper-input>
        <paper-input id="twitter" label="Twitter"></paper-input>
        <paper-input id="github" label="GitHub"></paper-input>
        <section>
          <h4>Логотип организации (обязательно)</h4>
          <ht-organization-editor-image id="image"></ht-organization-editor-image>
        </section>
        <section>
          <h4>Об организации</h4>
          <ht-wysiwyg id="description"></ht-wysiwyg>
        </section>
        <section id="actions">
          <paper-button on-click=${e => {
            orgId === "" ? this.add() : this.save();
          }}>${orgId === "" ? "Добавить" : "Сохранить"}</paper-button>
        </section>
      </div>
`;
  }

  static get is() {
    return "ht-organization-editor";
  }

  static get properties() {
    return {
      orgId: String,
      loading: Boolean,
      loadingText: String
    };
  }

  constructor() {
    super();
    this.orgId = "";
    this.loading = true;
    this.loadingText = "Загрузка данных";
  }

  async _getOrgData(orgId) {
    try {
      let snapshot = await firebase
        .firestore()
        .collection("organizations")
        .doc(orgId)
        .get();
      let itemData = snapshot.data();
      return itemData;
    } catch (err) {
      console.log("_setOrgData: " + err.message);
    }
  }

  async _setDefaultData() {
    try {
      this.shadowRoot.querySelector("#displayName").value = "";
      this.shadowRoot.querySelector("#country").value = "";
      this.shadowRoot.querySelector("#city").value = "";
      this.shadowRoot.querySelector("#phone").value = "";
      this.shadowRoot.querySelector("#website").value = "";
      this.shadowRoot.querySelector("#google").value = "";
      this.shadowRoot.querySelector("#facebook").value = "";
      this.shadowRoot.querySelector("#twitter").value = "";
      this.shadowRoot.querySelector("#github").value = "";
      this.shadowRoot.querySelector("#image").reset();
      this.shadowRoot.querySelector("#description").setDefaultData();
    } catch (err) {
      console.log("_setDefaultData: " + err.message);
    }
  }

  async _setOrgData(orgId) {
    try {
      let orgData = await this._getOrgData(orgId);
      this.shadowRoot.querySelector("#displayName").value = orgData.displayName;
      this.shadowRoot.querySelector("#country").value = orgData.country;
      this.shadowRoot.querySelector("#city").value = orgData.city;
      this.shadowRoot.querySelector("#phone").value = orgData.phone;
      this.shadowRoot.querySelector("#website").value = orgData.website;
      this.shadowRoot.querySelector("#google").value = orgData.google;
      this.shadowRoot.querySelector("#facebook").value = orgData.facebook;
      this.shadowRoot.querySelector("#twitter").value = orgData.twitter;
      this.shadowRoot.querySelector("#github").value = orgData.github;
      this.shadowRoot.querySelector("#image").data = orgData.image;
      this.shadowRoot
        .querySelector("#description")
        .setData(orgData.description);
    } catch (err) {
      console.log("_setOrgData: " + err.message);
    }
  }

  async add() {
    try {
      this.loading = true;
      this.loadingText = "Создание организации";
      let org = {};
      org.created = firebase.firestore.FieldValue.serverTimestamp();
      org.updated = firebase.firestore.FieldValue.serverTimestamp();
      org.ownerId = firebase.auth().currentUser.uid;
      org.sales = 0;
      org.verified = false;
      org.displayName = this.shadowRoot.querySelector("#displayName").value;
      org.country = this.shadowRoot.querySelector("#country").value;
      org.city = this.shadowRoot.querySelector("#city").value;
      org.phone = this.shadowRoot.querySelector("#phone").value;
      org.website = this.shadowRoot.querySelector("#website").value;
      org.google = this.shadowRoot.querySelector("#google").value;
      org.facebook = this.shadowRoot.querySelector("#facebook").value;
      org.twitter = this.shadowRoot.querySelector("#twitter").value;
      org.github = this.shadowRoot.querySelector("#github").value;
      org.image = this.shadowRoot.querySelector("#image").data || {};
      org.description = this.shadowRoot.querySelector("#description").getData();
      await firebase
        .firestore()
        .collection("organizations")
        .add(org);
      this.dispatchEvent(
        new CustomEvent("on-add", {
          bubbles: true,
          composed: true
        })
      );
      this.loading = false;
    } catch (err) {
      console.log("add: " + err.message);
    }
  }

  async save() {
    try {
      this.loading = true;
      this.loadingText = "Идет сохранение";
      let orgId = this.orgId;
      let updates = {};
      updates.updated = firebase.firestore.FieldValue.serverTimestamp();
      updates.displayName = this.shadowRoot.querySelector("#displayName").value;
      updates.country = this.shadowRoot.querySelector("#country").value;
      updates.city = this.shadowRoot.querySelector("#city").value;
      updates.phone = this.shadowRoot.querySelector("#phone").value;
      updates.website = this.shadowRoot.querySelector("#website").value;
      updates.google = this.shadowRoot.querySelector("#google").value;
      updates.facebook = this.shadowRoot.querySelector("#facebook").value;
      updates.twitter = this.shadowRoot.querySelector("#twitter").value;
      updates.github = this.shadowRoot.querySelector("#github").value;
      updates.image = this.shadowRoot.querySelector("#image").data || {};
      updates.description = this.shadowRoot
        .querySelector("#description")
        .getData();
      await firebase
        .firestore()
        .collection("organizations")
        .doc(orgId)
        .update(updates);
      this.dispatchEvent(
        new CustomEvent("on-updated", {
          bubbles: true,
          composed: true
        })
      );
      this.loading = false;
    } catch (err) {
      console.log("add: " + err.message);
    }
  }

  async reset() {
    await this._setDefaultData();
    if (this.orgId !== "") await this._setOrgData(this.orgId);
    this.loading = false;
  }
}

customElements.define(HTItemEditor.is, HTItemEditor);
