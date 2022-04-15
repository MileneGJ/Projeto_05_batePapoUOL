let nomeObj = {}
let mensagem = {
    from: "",
    to: "",
    text: "",
    type: ""
}

const inputEntrada = document.querySelector(".tela-entrada input");
inputEntrada.addEventListener("keydown",function (event){
    if(event.keyCode===13){
        document.querySelector(".tela-entrada button").click();
    }
});
const inputMsg = document.querySelector(".rodape input");
inputMsg.addEventListener("keydown",function (event){
    if(event.keyCode===13){
        document.querySelector(".rodape ion-icon").click();
    }
});


function entrarNaSala() {
    let inputEntrada = document.querySelector(".tela-entrada input");
    const nome = inputEntrada.value;
    document.querySelector(".entrada").classList.add("escondido");
    document.querySelector(".carregando").classList.remove("escondido");
    nomeObj = { name: nome };
    let promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', nomeObj);
    promise.then(aparecerChat);
    promise.catch(tratarErro);
    document.querySelector(".tela-entrada input").value = "";
}

function aparecerChat() {
    document.querySelector(".tela-entrada").classList.add("escondido");
    refrescarChat();
    atualizarContatos();
    let IDinterval = setInterval(manterStatus, 4000);
    let IDinterval2 = setInterval(refrescarChat, 3000);
    let IDinterval3 = setInterval(atualizarContatos, 10000);
}
function tratarErro(erro) {
    let codigo = erro.response.status;
    if (codigo === 400) {
        alert("Já existe um usuário online com esse nome.\nPor favor escolha outro nome.");
    }
    document.querySelector(".entrada").classList.remove("escondido");
    document.querySelector(".carregando").classList.add("escondido");
 
}
function atualizarPagina() {
    window.location.reload();
}
function manterStatus() {
    axios.post('https://mock-api.driven.com.br/api/v6/uol/status', nomeObj);
}
function refrescarChat() {
    let promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promise.then(renderizarMsgs);
}
function atualizarContatos() {
    let promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
    promise.then(renderizarContatos);
}
function renderizarMsgs(response) {
    let MsgPrevia = document.querySelector(".container > div:last-child > p");
    let chat = document.querySelector(".container");
    chat.innerHTML = "";
    for (let i = 0; i < response.data.length; i++) {
        if (response.data[i].type === "private_message" &&
            (response.data[i].from !== nomeObj.name &&
                response.data[i].to !== nomeObj.name)) {
        } else {
            let complemento = "";
            if (response.data[i].type === "message") {
                complemento = `para <strong>${response.data[i].to}</strong>:`;
            }
            if (response.data[i].type === "private_message") {
                complemento = `reservadamente para <strong>${response.data[i].to}</strong>:`;
            }
            chat.innerHTML += `<div class="${response.data[i].type}">
    <p class="tempo">(${response.data[i].time})</p> 
    <p>  <strong>${response.data[i].from}</strong> ${complemento} ${response.data[i].text}</p>        
</div>`
        }
    }
    let MsgNova = document.querySelector(".container > div:last-child > p");
    if (MsgPrevia === null) {
        MsgNova.scrollIntoView();
    } else if (MsgNova.innerHTML !== MsgPrevia.innerHTML) {
        MsgNova.scrollIntoView();
    }
}

function renderizarContatos(response) {
    let contatoSelect = document.querySelector(".contatos .selecionado");
    const nomeSelect = contatoSelect.parentNode.querySelector("p").innerHTML;
    let manterSelect = "";
    if (nomeSelect === "Todos") { manterSelect = " selecionado" }
    let contatos = document.querySelector(".contatos");
    contatos.innerHTML = `<div onclick="selecionarContato(this)">
<ion-icon name="people"></ion-icon>
<p>Todos</p>
<ion-icon class="check${manterSelect}" name="checkmark-outline"></ion-icon>
</div>`;
    for (let i = 0; i < response.data.length; i++) {
        manterSelect = "";
        if (nomeSelect === response.data[i].name) { manterSelect = " selecionado" }
        contatos.innerHTML += `<div onclick="selecionarContato(this)">
<ion-icon name="person-circle"></ion-icon>
<p>${response.data[i].name}</p>
<ion-icon class="check${manterSelect}" name="checkmark-outline"></ion-icon>
</div>`
    }
}
function aparecerMenu() {
    atualizarContatos();
    document.querySelector(".caixa-menu").classList.remove("escondido");
}
function desaparecerMenu() {
    document.querySelector(".caixa-menu").classList.add("escondido");
}

function enviarMensagem() {
    const conteudo = document.querySelector(".rodape input").value;
    if (conteudo === null) { } else {
        mensagem.from = nomeObj.name;
        if (mensagem.to === "") { mensagem.to = "Todos" }
        mensagem.text = conteudo;
        if (mensagem.type === "") { mensagem.type = "message" }
        let promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', mensagem);
        promise.then(refrescarChat);
        promise.catch(atualizarPagina);
        document.querySelector(".rodape input").value = "";
    }
}


function selecionarContato(element) {
    let listaContatos = document.querySelectorAll(".contatos .check");
    for (let i = 0; i < listaContatos.length; i++) {
        listaContatos[i].classList.remove("selecionado");
    }
    element.querySelector(".check").classList.add("selecionado");
    let novoContato = element.querySelector("p").innerHTML;
    mensagem.to = novoContato;
    let descricao = document.querySelector(".rodape p");
    if (mensagem.to !== "Todos") {
        descricao.innerHTML = `Enviando para ${mensagem.to}`;
        if (mensagem.type === "private_message") {
            descricao.innerHTML += " (reservadamente)";
        }
    } else {
        descricao.innerHTML = " ";
    }
}

function selecionarVisib(element) {
    let listaVisib = document.querySelectorAll(".visibilidade .check");
    for (let i = 0; i < listaVisib.length; i++) {
        listaVisib[i].classList.remove("selecionado");
    }
    element.querySelector(".check").classList.add("selecionado");
    let novaVisib = element.querySelector("p").innerHTML;
    let descricao = document.querySelector(".rodape p");
    if (novaVisib === "Reservadamente") {
        mensagem.type = "private_message";
        if (mensagem.to !== "Todos") {
            descricao.innerHTML += " (reservadamente)";
        }
    }
    if (novaVisib === "Público") {
        mensagem.type = "message";
        if (mensagem.to !== "Todos") {
            descricao.innerHTML = `Enviando para ${mensagem.to}`;
        }
    }
}