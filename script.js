let nomeObj = {}
function entrarNaSala() {
    const nome = document.querySelector(".tela-entrada input").value;
    nomeObj = { name: nome };
    let promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', nomeObj);
    promise.then(aparecerChat);
    promise.catch(tratarErro);
}

function aparecerChat() {
    document.querySelector(".tela-entrada").classList.add("escondido");
    let IDinterval = setInterval(manterStatus, 4000);
    let IDinterval2 = setInterval(refrescarChat,3000);
}
function tratarErro(erro) {
    let codigo = erro.response.status;
    if (codigo === 400) {
        alert("Já existe um usuário online com esse nome.\nPor favor escolha outro nome.");
    }
}
function manterStatus() {
    axios.post('https://mock-api.driven.com.br/api/v6/uol/status', nomeObj);
}
function refrescarChat() {
    let promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promise.then(renderizarMsgs);
}
function renderizarMsgs(response) {
    let MsgPrevia = document.querySelector(".container > div:last-child > p");
    let chat = document.querySelector(".container");
    chat.innerHTML = "";
    for (let i = 0; i < response.data.length; i++) {
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
    let MsgNova = document.querySelector(".container > div:last-child > p");
    if(MsgNova.innerHTML!==MsgPrevia.innerHTML){
        alert("Mensagem nova!!");
        MsgNova.scrollIntoView();
    }
}
function enviarMensagem() {
    const conteudo = document.querySelector(".rodape input").value;
    let mensagem = {
        from: nomeObj.name,
        to: "Todos",
        text: conteudo,
        type: "message"
    }
    let promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', mensagem);
    promise.then(refrescarChat);
}