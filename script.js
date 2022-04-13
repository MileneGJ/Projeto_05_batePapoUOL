function entrarNaSala(){
    const nome = document.querySelector(".tela-entrada input").value;
let nomeObj = {name:nome};
    let promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants',nomeObj);
    promise.then(aparecerChat);
    promise.catch(tratarErro);
}

function aparecerChat(){
    document.querySelector(".tela-entrada").classList.add("escondido");
}
function tratarErro(erro){
    let codigo = erro.response.status
    if(codigo===400){
        alert("Já existe um usuário online com esse nome.\nPor favor escolha outro nome.")
    }
}