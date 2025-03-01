import { debounce } from 'underscore';
function varreEReposiciona(elementoPai: HTMLElement|ShadowRoot, eCarregamento: boolean = false, eShadowRoot: boolean = false) {
    const filhos: Node[] = Array.from(elementoPai.childNodes as NodeListOf<Node>);
    const intervaloOriginal: Range = document.createRange();
    intervaloOriginal.setStartBefore(elementoPai);
    intervaloOriginal.setEndAfter(elementoPai);
    filhos.sort((a, b) => {
        const rectA = getNodeBoundingRect(a);
        const rectB = getNodeBoundingRect(b);
        if (!rectA || !rectB) {
            return 0;
        }
        if (rectA.top < rectB.top) {
            return -1;
        }
        else
            if (rectA.top > rectB.top) {
                return 1;
            }
            else {
                if (rectA.left < rectB.left) {
                    return -1;
                }
                else
                    if (rectA.left > rectB.left) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
            }
    });
    let posicaoElemento: DOMRect = mapaElementos.get(elementoPai).getBoundingClientRect();
    let posicaoAtualElemento: DOMRect | undefined;
    if (elementoPai instanceof HTMLElement) {
        if (posicaoElemento) {
            posicaoAtualElemento = elementoPai.getBoundingClientRect();
        }
    }
    if (posicaoAtualElemento && (posicaoElemento.left !== posicaoAtualElemento.left || posicaoElemento.top !== posicaoAtualElemento.top || eCarregamento))
    {
        mapaElementos.set(elementoPai, elementoPai.cloneNode(false));
        if(elementoPai instanceof HTMLElement && elementoPai.shadowRoot!=null)
        {
            clonaShadowRoot(elementoPai);
            varreEReposiciona(elementoPai.shadowRoot, eShadowRoot=true);
        }
        intervaloOriginal.deleteContents();
        filhos.reverse().forEach(element => {
            intervaloOriginal.insertNode(element);
            if (element instanceof HTMLElement) {
                if ((element as HTMLElement).childElementCount > 0 && !((element as HTMLElement).getAttribute("slot"))) {
                    varreEReposiciona(element as HTMLElement, eCarregamento, eShadowRoot);
                }
            }
        });
    }
}
function getNodeBoundingRect(node: Node): DOMRect | undefined {
    if (node instanceof HTMLElement) {
        return node.getBoundingClientRect();
    }
    else
        if (node instanceof Text) {
            const range: Range = document.createRange();
            range.selectNodeContents(node);
            return range.getBoundingClientRect();
        }
}
const observer = new MutationObserver((mutacoes: MutationRecord[], observer: MutationObserver) => {
    mutacoes.forEach(mutacao => {
        if (mutacao.type == "childList" && !mapaElementos.has(mutacao.target as HTMLElement)) {
            varreEReposiciona(mutacao.target as HTMLElement);
            Array.from(mutacao.addedNodes).forEach(element => {
                if (element instanceof HTMLElement) {
                    resizeObserver.observe(element as HTMLElement);
                    let coordenadas: DOMRect = (element as HTMLElement).getBoundingClientRect();
                    let coordenadasPai: DOMRect = (element.parentElement as HTMLElement).getBoundingClientRect();
                    if (coordenadasPai.top > coordenadas.top || coordenadasPai.left > coordenadas.left && !mapaElementos.has(element as HTMLElement)) {
                        varreEReposiciona(document.body);
                    }
                }
            });
            Array.from(mutacao.removedNodes).forEach(element => {
                resizeObserver.unobserve(element as HTMLElement);
                if (mapaElementos.has(element as HTMLElement)) {
                    //mapaElementos.delete(element as HTMLElement);
                }
            });
        }
    });
});
observer.observe(document.body, { childList: true, subtree: true });
var resizeObserver = new ResizeObserver(entries => {
    varreEReposiciona(document.body);
});
observaElementosComResizeObserver(document.body);
function observaElementosComResizeObserver(elementoPai: HTMLElement) {
    mapaElementos.set(elementoPai, elementoPai.cloneNode(false));
    if ((elementoPai.childElementCount > 1) || (elementoPai.childElementCount == 1 && elementoPai.children[0] instanceof HTMLElement)) {
        Array.from(elementoPai.children).forEach(element => {
            if (element.childElementCount >= 1) {
                observaElementosComResizeObserver(element as HTMLElement);
            }
            else {
                resizeObserver.observe(element, { box: "border-box" });
                mapaElementos.set(element, element.cloneNode(false));
            }
        });
    }
    else {
        resizeObserver.observe(elementoPai, { box: "border-box" });
    }
}
function observaElementosDoShadowDOMComMutationObserver(elementoPai: HTMLElement)
{
    if(elementoPai==document.body && elementoPai.shadowRoot)
    {
        observer.observe(elementoPai.shadowRoot);
    }
    if ((elementoPai.childElementCount > 1) || (elementoPai.childElementCount == 1 && elementoPai.children[0] instanceof HTMLElement))
    {
        Array.from(elementoPai.children).forEach(element =>
            {
            if (element instanceof HTMLElement && element.shadowRoot)
            {
                observer.observe(element.shadowRoot, { childList: true, subtree: true });
                clonaShadowRoot(element);
            }
            if (element instanceof HTMLElement && ((element.childElementCount > 1) || (element.childElementCount == 1 && element.children[0] instanceof HTMLElement)))
            {
                observaElementosDoShadowDOMComMutationObserver(element as HTMLElement);
            }
        });
    }
    else
    if(elementoPai.shadowRoot&&elementoPai!=document.body)
    {
        observer.observe(elementoPai.shadowRoot, { childList: true, subtree: true });
        clonaShadowRoot(elementoPai);
    }
}
let mapaElementos = new WeakMap();
window.addEventListener("resize", (event: UIEvent) => { debounce(function () { varreEReposiciona(document.body) }, 300, true) });
varreEReposiciona(document.body);
function clonaShadowRoot(element: HTMLElement)
{
    if(element.shadowRoot)
    {
    const elementoClonado = mapaElementos.get(element);
    const shadowRootOriginal = element.shadowRoot;
const shadowRootClonado = elementoClonado.attachShadow({mode: shadowRootOriginal.mode, delegatesFocus: shadowRootOriginal.delegatesFocus, serializable: shadowRootOriginal.serializable, clonable: shadowRootOriginal.clonable, slotAssignment: shadowRootOriginal.slotAssignment});
    shadowRootClonado.innerHTML=shadowRootOriginal.innerHTML;
    shadowRootClonado.adoptedStyleSheets = shadowRootOriginal.adoptedStyleSheets;
    }
}