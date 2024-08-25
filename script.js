const url = `https://servicodados.ibge.gov.br/api/v3/noticias/`

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    iniciaPadrao(params)
    iniciaFiltro(params);
    buscaNoticia();
})

function iniciaPadrao(params){
    if (!params.has('qtd')) params.set('qtd', 10)
    if (!params.has('page')) params.set('page', 1)
    
    history.replaceState({}, "", `${location.pathname}?${params}`)
}

function iniciaFiltro(params){
    const filterCont = document.querySelector('#filter-count')
    let count = params.size

    for (const key of params.keys()) {
        if (key === 'page' || key === 'busca') count--;
    }

    filterCont.textContent = count;
}

async function buscaNoticia(){
    const params = new URLSearchParams(location.search);
    const content = await fetch(`${url}?${params}`).then((response) => response.json());
    setQuantidade(content.count, params)
    setConteudo(content);
    setPagination(content)
    paginationStyle(params.get('page'))
}

function setQuantidade(count, params){
    const picklist = document.querySelector("#qtd");
    let qtd = params.get('qtd')
    if (qtd > count || qtd === null) qtd = 10

    picklist.innerHTML = `<option value="5">5</option><option value="10">10</option>`

    for (let i = 15; i < 35; i+= 5){
        const option = new Option(i, i)
        picklist.appendChild(option)
    }

    document.querySelector(`option[value="${qtd}"]`).setAttribute('selected', 'selected')
}

function setConteudo(content){
    const ul = document.querySelector('#news');
    ul.innerHTML = "";

    for (const c of content.items){
        const li = document.createElement('li');

        try{
            li.innerHTML = `
            <img src="${formatImage(c.imagens)}">
            <div class="content-text">
                <h2>${c.titulo}</h2>
                <p>${c.introducao}</p>
                <div class="content-spans">
                    <span>${formatEditorias(c.editorias)}</span>
                    <span>${formatPublishedDate(c.data_publicacao)}</span>
                </div>
                <a href="${c.link}" target="_blank"><button class="read-more">Leia mais</button></a>
            </div>
            <br>
            `
        }catch(e){
            console.error(e)
        }

        ul.appendChild(li)
    }
}

function setPagination(content){
    const ul = document.querySelector('#pagination')
    ul.innerHTML = ""

    const actual = content.page;
    const total = content.totalPages;
    const leftSize = 5;
    const rightSize = 4;

    let start = actual - leftSize;
    let end = actual + rightSize;

    if (start <= 0) {
        end = end - start + 1;
        start = 1;
    }

    if (end > total) {
        end = total;
        start = Math.max(end - leftSize - rightSize, 1);
    }

    if (start < 1) {
        start = 1;
    }

    for (let i = start; i <= end; i++){
        const li = document.createElement('li');
        const button = document.createElement('button');

        button.textContent = i;
        button.value = i;
        button.classList.add('pagination-button')

        button.addEventListener('click', setPage)

        li.appendChild(button)
        ul.appendChild(li)
    }
}