import {safeParseJson} from '@lunasec/services-common/build/utils/json';
import {patchStyle, AttributesMessage, StyleInfo} from '@lunasec/secure-frame-common';
import {AllowedElements} from '@lunasec/react-sdk'

import {detokenize, notifyParentOfEvent, listenForRPCMessages} from './rpc';
import { handleDownload } from "./secure-download";

export type SupportedElement = AllowedElements[keyof AllowedElements]

// Would be nice if class could take <element type parameter> but couldn't quite get it working
export class SecureFrame {
    private readonly secureElement: SupportedElement;
    private readonly elementType: keyof AllowedElements;
    private readonly loadingText: Element;
    private readonly frameNonce: string;
    private readonly origin: string;
    private initialized = false;
    constructor(elementName: keyof AllowedElements, loadingText: Element) {
        this.elementType = elementName;
        this.loadingText = loadingText;
        this.secureElement = this.insertSecureElement(elementName);
        this.origin = this.getURLSearchParam('origin');
        this.frameNonce = this.getURLSearchParam('n');

        listenForRPCMessages(this.origin, (attrs) => {void this.setAttributesFromRPC(attrs)});
        notifyParentOfEvent('NotifyOnStart', this.origin, this.frameNonce);
    }

    insertSecureElement(elementName:keyof AllowedElements){
        const body = document.getElementsByTagName("BODY")[0];
        const secureElement = document.createElement(elementName);
        secureElement.className = 'secure-input d-none';
        body.appendChild(secureElement);
        return secureElement;
    }

    getURLSearchParam(paramName: string){
        const searchParams = (new URL(document.location.href)).searchParams;
        const param = searchParams.get(paramName)
        if(!param){
            throw new Error(`Missing parameter from iframe url ${paramName}`)
        }
        return param
    }

    // Set up the iframe attributes, used on both page load and on any subsequent changes
    async setAttributesFromRPC(attrs: AttributesMessage) {
        // First time setup
        if (!this.initialized) {
            this.loadingText.classList.add('d-none');
            this.secureElement.classList.remove('d-none');
            if (!attrs.style) {
                console.error('Attribute frame message missing necessary style parameter for first time frame startup', attrs);
                return;
            }
        }

        if (attrs.style) {
            patchStyle(this.secureElement, safeParseJson<StyleInfo>(attrs.style));
        }

        if (attrs.type && this.elementType === 'input') {
            this.secureElement.setAttribute('type', attrs.type);
        }

        if (attrs.token) {
            const value = await detokenize(attrs.token)
            if (this.elementType === 'input' || this.elementType ==='textarea'){
                const input = this.secureElement as HTMLInputElement
                input.value = value;
            }
            if (this.elementType === 'span'){
                this.secureElement.textContent = value;
            }
            if (this.elementType === 'a'){ // anchor elements mean we are doing an s3 secure download
                // Figure out why this type casting is necessary
                handleDownload(attrs.token, this.secureElement as HTMLAnchorElement, attrs.filename || 'document.pdf')
            }
        }
        if (this.elementType === 'input'){
            this.attachOnBlurNotifier();
        }
        this.initialized = true;
        return;
    }

    attachOnBlurNotifier() {
        this.secureElement.addEventListener('blur', () => {
            notifyParentOfEvent('NotifyOnBlur', this.origin, this.frameNonce);
        });
    }
}
