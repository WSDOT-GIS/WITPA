import dialogPolyfill from "dialog-polyfill";

/**
 * Sets up dialog elements. Registers the dialogs with
 * the dialog-polyfill (if not supported natively by the
 * browser) and sets up the functionality of the dialogs'
 * close buttons.
 * @param dialogs A collection of HTMLDialogElements.
 * Defaults to all dialog elements in a page if omitted.
 */
export function setupDialogs(
  dialogs:
    | NodeListOf<HTMLDialogElement>
    | ArrayLike<HTMLDialogElement> = document.querySelectorAll<
    HTMLDialogElement
  >("dialog")
) {
  // Register the dialog with the dialog polyfill
  // if the browser does not natively support
  // the dialog element.
  if (!(window as any).HTMLDialogElement) {
    Array.from(dialogs, d => {
      dialogPolyfill.registerDialog(d);
    });
  }

  // Setup dialog close button.
  Array.from(document.querySelectorAll<HTMLDialogElement>("dialog"), d => {
    const closeButton = d.querySelector("button[value='close']");
    if (closeButton) {
      closeButton.addEventListener("click", (e: Event) => {
        d.close();
      });
    }
  });
}

/**
 * Creates a unique element id to use in a document.
 * @param suggestedId - ID you would like to use but don't know if it has been used in doc yet.
 */
export function generateId(suggestedId?: string) {
  if (!suggestedId) {
    suggestedId = "id";
  }

  let checkId = suggestedId;
  let i = 0;
  while (document.getElementById(checkId)) {
    checkId = `${suggestedId}${i}`;
    i++;
  }
  return checkId;
}
