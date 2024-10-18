import { debounce } from 'underscore';
function varreEReposiciona(elementoPai, eCarregamento = false) {
    const filhos = Array.from(elementoPai.childNodes);
    const intervaloOriginal = document.createRange();
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
        else if (rectA.top > rectB.top) {
            return 1;
        }
        else {
            if (rectA.left < rectB.left) {
                return -1;
            }
            else if (rectA.left > rectB.left) {
                return 1;
            }
            else {
                return 0;
            }
        }
    });
    let posicaoElemento = mapaElementos.get(elementoPai).getBoundingClientRect();
    let posicaoAtualElemento;
    if (elementoPai instanceof HTMLElement) {
        if (posicaoElemento) {
            posicaoAtualElemento = elementoPai.getBoundingClientRect();
        }
    }
    if (posicaoAtualElemento && (posicaoElemento.left !== posicaoAtualElemento.left || posicaoElemento.top !== posicaoAtualElemento.top || eCarregamento)) {
        mapaElementos.set(elementoPai, elementoPai.cloneNode(false));
        intervaloOriginal.deleteContents();
        filhos.reverse().forEach(element => {
            intervaloOriginal.insertNode(element);
            if (element instanceof HTMLElement) {
                if (element.childElementCount > 0) {
                    varreEReposiciona(element, eCarregamento);
                }
            }
        });
    }
}
function getNodeBoundingRect(node) {
    if (node instanceof HTMLElement) {
        return node.getBoundingClientRect();
    }
    else if (node instanceof Text) {
        const range = document.createRange();
        range.selectNodeContents(node);
        return range.getBoundingClientRect();
    }
}
const observer = new MutationObserver((mutacoes, observer) => {
    mutacoes.forEach(mutacao => {
        if (mutacao.type == "childList" && !mapaElementos.has(mutacao.target)) {
            varreEReposiciona(mutacao.target);
            Array.from(mutacao.addedNodes).forEach(element => {
                if (element instanceof HTMLElement) {
                    resizeObserver.observe(element);
                    let coordenadas = element.getBoundingClientRect();
                    let coordenadasPai = element.parentElement.getBoundingClientRect();
                    if (coordenadasPai.top > coordenadas.top || coordenadasPai.left > coordenadas.left && !mapaElementos.has(element)) {
                        varreEReposiciona(document.body);
                    }
                }
            });
            Array.from(mutacao.removedNodes).forEach(element => {
                resizeObserver.unobserve(element);
                if (mapaElementos.has(element)) {
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
function observaElementosComResizeObserver(elementoPai) {
    mapaElementos.set(elementoPai, elementoPai.cloneNode(false));
    if ((elementoPai.childElementCount > 1) || (elementoPai.childElementCount == 1 && elementoPai.children[0] instanceof HTMLElement)) {
        Array.from(elementoPai.children).forEach(element => {
            if (element.childElementCount >= 1) {
                observaElementosComResizeObserver(element);
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
let mapaElementos = new WeakMap();
window.addEventListener("resize", (event) => { debounce(function () { varreEReposiciona(document.body); }, 300, true); });
varreEReposiciona(document.body);
