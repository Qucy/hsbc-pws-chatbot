// Create a new file for the custom feedback component
let CustomFeedbackElement: typeof HTMLElement | null = null;

// Only define the class in browser environments
if (typeof window !== 'undefined') {
  CustomFeedbackElement = class extends HTMLElement {
    private renderRoot: ShadowRoot;

    constructor() {
      super();
      // It is recommended to contain the custom element in a shadow root
      this.renderRoot = this.attachShadow({mode: 'open'});
    }

    // Web component Lifecycle method
    connectedCallback() {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.gap = '10px';
      wrapper.style.margin = '5px 0';

      // Create thumbs up button
      const thumbsUpButton = document.createElement('button');
      thumbsUpButton.innerHTML = '👍';
      thumbsUpButton.style.padding = '5px 10px';
      thumbsUpButton.style.borderRadius = '5px';
      thumbsUpButton.style.cursor = 'pointer';
      thumbsUpButton.addEventListener('click', () => {
        this._onFeedbackClick('positive');
      });
      
      // Create thumbs down button
      const thumbsDownButton = document.createElement('button');
      thumbsDownButton.innerHTML = '👎';
      thumbsDownButton.style.padding = '5px 10px';
      thumbsDownButton.style.borderRadius = '5px';
      thumbsDownButton.style.cursor = 'pointer';
      thumbsDownButton.addEventListener('click', () => {
        this._onFeedbackClick('negative');
      });

      wrapper.appendChild(thumbsUpButton);
      wrapper.appendChild(thumbsDownButton);
      this.renderRoot.appendChild(wrapper);
    }

    // Called when feedback button is clicked
    _onFeedbackClick(type: 'positive' | 'negative') {
      const event = new CustomEvent("df-custom-submit-feedback-clicked", {
        // `detail` may be any string,
        // this will be sent to the backend to be stored.
        detail: JSON.stringify({
          "feedbackType": type,
          "timestamp": new Date().toISOString()
        }),
        // Required to propagate up the DOM tree
        bubbles: true,
        // Required to propagate across ShadowDOM
        composed: true,
      });
      this.dispatchEvent(event);
      
      // Show thank you message
      const wrapper = this.renderRoot.querySelector('div');
      if (wrapper) {
        wrapper.innerHTML = '';
        const thankYouMsg = document.createElement('div');
        thankYouMsg.textContent = 'Thank you for your feedback!';
        thankYouMsg.style.padding = '5px';
        wrapper.appendChild(thankYouMsg);
      }
    }
  };

  // Register the custom element
  if (!customElements.get('df-external-custom-feedback')) {
    customElements.define('df-external-custom-feedback', CustomFeedbackElement);
  }
}

export { CustomFeedbackElement };