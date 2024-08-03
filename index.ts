function varreEReposiciona(elementoPai:HTMLElement)
{
    const filhos:Node[]=Array.from(elementoPai.childNodes as NodeListOf<Node>);
    const intervaloOriginal:Range=document.createRange();
    intervaloOriginal.setStartBefore(filhos[0]);
    intervaloOriginal.setEndAfter(filhos[filhos.length-1]);
    filhos.sort((a, b)=>{
const rectA=getNodeBoundingRect(a);
const rectB=getNodeBoundingRect(b);
if(rectA.top<rectB.top)
{
    return -1;
}
else
if(rectA.top>rectB.top)
{
    return 1;
}
else
{
    if(rectA.left<rectB.left)
    {
        return -1;
    }
    else
    if(rectA.left>rectB.left)
    {
        return 1;
    }
    else
    {
        return 0;
    }
}
    });
    intervaloOriginal.deleteContents();
    filhos.reverse().forEach(elemento=>{
        intervaloOriginal.insertNode(elemento);
        if(elemento.childNodes.length >0)
        {
            varreEReposiciona(elemento as HTMLElement);
        }
    })
}
function getNodeBoundingRect(node:Node):DOMRect
{
    if(node instanceof HTMLElement)
    {
        return node.getBoundingClientRect();
    }
    else
    if(node instanceof Text)
    {
        const range=document.createRange();
        range.selectNodeContents(node);
        return range.getBoundingClientRect();
    }
}
const observer=new MutationObserver((mutacoes:MutationRecord[], observer:MutationObserver)=>{
    mutacoes.forEach(mutacao=>{
        if(mutacao.type=="childList")
        {
            varreEReposiciona(mutacao.target as HTMLElement);
            Array.from(mutacao.addedNodes).concat(Array.from(mutacao.removedNodes)).forEach(element=>{
                let coordenadas:DOMRect=(element as HTMLElement).getBoundingClientRect();
                let coordenadasPai:DOMRect=element.parentElement.getBoundingClientRect();
            if(coordenadasPai.top>coordenadas.top||coordenadasPai.left>coordenadas.left)
            {
                varreEReposiciona(document.body);
            }
});
        }
    });
});
observer.observe(document.body, {childList:true, subtree:true});
var corpoAntes:HTMLElement=document.body;
varreEReposiciona(corpoAntes);