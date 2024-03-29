import { LitElement, css, html } from 'lit-element';
import './just-button';

class TOSCavatar extends LitElement {
    static get styles() {
        return css`
            :host {
                display: inline-block;
                width: 100%;
                height: 100%;
            }

            #avatar-wrap {
                width: 250px;
                height: 250px;
                overflow: hidden;
                display: flex;
            }

            #avatar {
                border-radius: 50%;
                object-fit: cover;
                width: 100%;
            }

            #popup {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: #000000a0;
                z-index: 5;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            #popup[hidden] {
                display: none;
            }

            #container {
                background-color: #eee;
                width: 80%;
                border-radius: 10px;
            }

            #avatar-preview {
                position: relative;
                width: 80vw;
                height: 80vw;
                overflow: hidden;
                display: flex;
                border-top-left-radius: inherit;
                border-top-right-radius: inherit;
            }

            #avatar-preview img {
                object-fit: cover;
                width: 100%;
            }

            #error {
                display: block;
                position: absolute;
                background-color: #e06666;
                padding: 20px 30px;
                transition: top 0.2s;
                z-index: 10;
                width: 70vw;
                border-radius: 10px;
                left: 2vw;
                top: 10%;
                text-align: center;
            }

            #error[hidden] {
                display: block;
                top: -100%;
            }

            #avatar-preview::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                box-shadow: 0px 0px 0px 400px #000000a0;
                width: 100%;
                height: 100%;
                border-radius: 100%;
            }

            #controls {
                padding: 50px 30px;
                display: flex;
                justify-content: space-between;
                gap: 100px;
            }

            .button {
                flex: 1 1 0;
                width: 100%;
            }

            .upload {
                position: relative;
            }

            .upload-input {
                opacity: 0;
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
            }
        `;
    }

    static get properties() {
        return {
            previewAvatar: { type: String },
            avatar: { type: String },
            popup: { type: Boolean },
            errorHide: { type: Boolean },
            error: { type: String },
        };
    }

    constructor() {
        super();
        this.avatar = '/img/noavatar.png';
        this.popup = false;
        this.errorHide = true;
        this.file = undefined;
    }

    firstUpdated() {
        this.form = this.shadowRoot.querySelector('#controls');
        const avatar = this.getAttribute('value');
        if (avatar !== undefined && avatar !== '' && avatar !== 'undefined') this.avatar = avatar;
        console.log(this.avatar);
    }

    render() {
        return html`
            <div id="avatar-wrap" @click=${this.showPopup}>
                <img id="avatar" src=${this.avatar} />
            </div>
            <div id="popup" @click=${this.mbHidePopup} ?hidden=${!this.popup}>
                <div id="container">
                    <div id="avatar-preview">
                        <div id="error" ?hidden=${this.errorHide}>${this.error}</div>
                        <img src=${this.previewAvatar} />
                    </div>

                    <form id="controls">
                        <just-button class="button upload">
                            <input
                                class="upload-input"
                                name="file"
                                type="file"
                                @change=${this.previewFile}
                            />
                            Upload
                        </just-button>

                        <just-button class="button" @click=${this.saveAvatar}>Save</just-button>
                    </form>
                </div>
            </div>
        `;
    }

    mbHidePopup(e) {
        if (e.currentTarget === e.target) this.hidePopup();
    }

    showPopup() {
        this.previewAvatar = this.avatar;
        this.popup = true;
    }

    hidePopup() {
        this.popup = false;
    }

    tryFreeAvatar() {
        if (this.avatar.startsWith('blob:')) URL.revokeObjectURL(this.avatar);
    }

    saveAvatar() {
        this.tryFreeAvatar();
        this.avatar = this.previewAvatar;

        const formdata = new FormData(this.form);
        console.log(formdata);

        fetch('/uploadAvatar', { method: 'POST', body: formdata })
            .then((res) => res.text())
            .then((avatar) => {
                this.tryFreeAvatar();
                this.avatar = avatar;

                this.hidePopup();
                this.dispatchEvent(
                    new CustomEvent('new-avatar', {
                        detail: { avatar },
                    })
                );
            });
    }

    previewFile(e) {
        const [file] = e.target.files;
        if (file.type === 'image/jpeg' || file.type === 'image/png') {
            if (this.avatar !== this.previewAvatar && this.previewAvatar.startsWith('blob:'))
                URL.revokeObjectURL(this.previewAvatar);
            this.previewAvatar = URL.createObjectURL(file);
            this.file = file;
        } else {
            this.showError('Unsupported file type!');
        }
    }

    showError(error) {
        this.error = error;
        this.errorHide = false;
        setTimeout(() => (this.errorHide = true), 2000);
    }
}

customElements.define('tosc-avatar', TOSCavatar);
