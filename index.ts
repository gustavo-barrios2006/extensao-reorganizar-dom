function varreEReposiciona(elemento:HTMLElement)
{
    const filhos:HTMLElement[]=Array.from(elemento.childNodes as NodeListOf<HTMLElement>);
    filhos.sort((a, b)=>{
const rectA=a.getBoundingClientRect();
const rectB=b.getBoundingClientRect();
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
}
const corpo:HTMLElement=document.body;
varreEReposiciona(corpo);