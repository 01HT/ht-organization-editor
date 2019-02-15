"use strict";
import { LitElement, html, css } from "lit-element";
import "@polymer/paper-input/paper-input.js";
import "@01ht/ht-wysiwyg";
import "@01ht/ht-spinner";
import "@polymer/iron-iconset-svg";
import "@polymer/iron-icon";
import "@polymer/paper-tooltip";
import "./ht-organization-editor-avatar.js";

import {
  // callTestHTTPFunction,
  callFirebaseHTTPFunction
} from "@01ht/ht-client-helper-functions";

import { styles } from "@01ht/ht-theme/styles";

class HTItemEditor extends LitElement {
  static get styles() {
    return [
      styles,
      css`
        section {
          margin-top: 32px;
        }

        paper-input {
          max-width: 500px;
          width: 100%;
        }

        #nameInURLContainer {
          display: flex;
          align-items: center;
          position: relative;
          max-width: 500px;
          width: 100%;
        }

        #name-in-url {
          margin-right: 32px;
        }

        .warning {
          color: var(--accent-color);
          position: absolute;
          top: 28px;
          height: 24px;
          right: 0;
          bottom: 0;
          left: 0;
          display: flex;
          justify-content: flex-end;
        }

        #actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 32px;
        }

        #link {
          margin-bottom: 8px;
        }

        #container[hidden],
        ht-spinner[hidden],
        [hidden] {
          display: none;
        }
      `
    ];
  }

  render() {
    const { orgId, loading, loadingText, orgData } = this;
    return html`
      <iron-iconset-svg size="24" name="ht-organization-editor">
        <svg>
          <defs>
              <g id="warning"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path></g>   
          </defs>
        </svg>
      </iron-iconset-svg>
      <ht-spinner page text="${loadingText}" ?hidden="${!loading}"></ht-spinner>
      <div id="container" ?hidden="${loading}">
        <h1 class="mdc-typography--headline5">${
          orgId === "" ? "Добавить организацию" : "Настройки организации"
        }</h1>
        ${
          orgData && orgData.organizationNumber
            ? html`
        <div id="link">
          <a href="/organization/${orgData.nameInURL}/${
                orgData.organizationNumber
              }">Ссылка на страницу организации</a>
        </div>`
            : null
        }
        <paper-input id="displayName" label="Название"></paper-input>
        <div id="nameInURLContainer">
          <div class="warning">
              <iron-icon icon="ht-organization-editor:warning"></iron-icon>
              <paper-tooltip>
              Изменение влечет за собой изменение всех ссылок в которых задействован данный параметр. Существующие ссылки в интернете с параметром, станут недоступными и будут выдавать ошибку 404. Поисковым системам потребуется время для повторного индексирования ссылок и размещения информации в поисковой выдаче. Соответственно частое изменение данного параметра крайне не рекомендуется.
            </paper-tooltip>
          </div>
          <paper-input id="name-in-url" label="Название в URL" placeholder="my-organization-name-7" allowed-pattern="^[0-9a-z\-]+$" auto-validate>
            <div slot="prefix">/organization/</div>
            <div slot="suffix"></div>
          </paper-input>
        </div>
        <paper-input id="email" label="Адрес электронной почты"></paper-input>
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
          <ht-organization-editor-avatar id="avatar"></ht-organization-editor-avatar>
        </section>
        <section>
          <h4>Об организации</h4>
          <ht-wysiwyg id="description"></ht-wysiwyg>
        </section>
        <section id="actions">
          <paper-button @click="${e => {
            orgId === "" ? this.add() : this.save();
          }}">${orgId === "" ? "Добавить" : "Сохранить"}</paper-button>
        </section>
      </div>
`;
  }

  static get properties() {
    return {
      orgId: { type: String },
      loading: { type: Boolean },
      loadingText: { type: String },
      orgData: { type: Object }
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
      let orgData = snapshot.data();
      return orgData;
    } catch (err) {
      console.log("_setOrgData: " + err.message);
    }
  }

  async _setDefaultData() {
    try {
      this.shadowRoot.querySelector("#displayName").value = "";
      this.shadowRoot.querySelector("#name-in-url").value = "";
      this.shadowRoot.querySelector(
        "#name-in-url [slot='suffix']"
      ).innerHTML = ``;
      this.shadowRoot.querySelector("#email").value = "";
      this.shadowRoot.querySelector("#country").value = "";
      this.shadowRoot.querySelector("#city").value = "";
      this.shadowRoot.querySelector("#phone").value = "";
      this.shadowRoot.querySelector("#website").value = "";
      this.shadowRoot.querySelector("#google").value = "";
      this.shadowRoot.querySelector("#facebook").value = "";
      this.shadowRoot.querySelector("#twitter").value = "";
      this.shadowRoot.querySelector("#github").value = "";
      this.shadowRoot.querySelector("#avatar").reset();
      this.shadowRoot.querySelector("#description").setDefaultData();
    } catch (err) {
      console.log("_setDefaultData: " + err.message);
    }
  }

  async _setOrgData(orgId) {
    try {
      let orgData = await this._getOrgData(orgId);
      if (orgData === undefined) return;
      this.shadowRoot.querySelector("#displayName").value = orgData.displayName;
      this.shadowRoot.querySelector("#name-in-url").value = orgData.nameInURL;
      this.shadowRoot.querySelector(
        "#name-in-url [slot='suffix']"
      ).innerHTML = `/${orgData.organizationNumber}`;
      this.shadowRoot.querySelector("#email").value = orgData.email;
      this.shadowRoot.querySelector("#country").value = orgData.country;
      this.shadowRoot.querySelector("#city").value = orgData.city;
      this.shadowRoot.querySelector("#phone").value = orgData.phone;
      this.shadowRoot.querySelector("#website").value = orgData.website;
      this.shadowRoot.querySelector("#google").value = orgData.google;
      this.shadowRoot.querySelector("#facebook").value = orgData.facebook;
      this.shadowRoot.querySelector("#twitter").value = orgData.twitter;
      this.shadowRoot.querySelector("#github").value = orgData.github;
      this.shadowRoot.querySelector("#avatar").data = orgData.avatar;
      this.shadowRoot
        .querySelector("#description")
        .setData(orgData.description);
      this.orgData = orgData;
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
      org.nameInURL =
        this.shadowRoot.querySelector("#name-in-url").value || "no-name";
      org.email = this.shadowRoot.querySelector("#email").value;
      org.country = this.shadowRoot.querySelector("#country").value;
      org.city = this.shadowRoot.querySelector("#city").value;
      org.phone = this.shadowRoot.querySelector("#phone").value;
      org.website = this.shadowRoot.querySelector("#website").value;
      org.google = this.shadowRoot.querySelector("#google").value;
      org.facebook = this.shadowRoot.querySelector("#facebook").value;
      org.twitter = this.shadowRoot.querySelector("#twitter").value;
      org.github = this.shadowRoot.querySelector("#github").value;
      org.avatar = this.shadowRoot.querySelector("#avatar").data || {};
      org.description = this.shadowRoot.querySelector("#description").getData();

      let response = await callFirebaseHTTPFunction({
        name: "httpsOrganizationsCreateOrganizationIndex",
        authorization: true,
        options: {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            orgData: org
          })
        }
      });
      this.loading = false;
      if (response.created === true) {
        this.dispatchEvent(
          new CustomEvent("on-add", {
            bubbles: true,
            composed: true
          })
        );
      } else {
        this.dispatchEvent(
          new CustomEvent("show-toast", {
            bubbles: true,
            composed: true,
            detail: {
              text: `При создании организации возникла ошибка: ${
                response.error
              }`
            }
          })
        );
      }
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
      updates.nameInURL =
        this.shadowRoot.querySelector("#name-in-url").value || "no-name";
      updates.email = this.shadowRoot.querySelector("#email").value;
      updates.country = this.shadowRoot.querySelector("#country").value;
      updates.city = this.shadowRoot.querySelector("#city").value;
      updates.phone = this.shadowRoot.querySelector("#phone").value;
      updates.website = this.shadowRoot.querySelector("#website").value;
      updates.google = this.shadowRoot.querySelector("#google").value;
      updates.facebook = this.shadowRoot.querySelector("#facebook").value;
      updates.twitter = this.shadowRoot.querySelector("#twitter").value;
      updates.github = this.shadowRoot.querySelector("#github").value;
      updates.avatar = this.shadowRoot.querySelector("#avatar").data || {};
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

customElements.define("ht-organization-editor", HTItemEditor);
