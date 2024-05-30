// configurações iniciais

import express from "express"
import cors from "cors"
import bcrypt from "bcrypt"

const app = express();

app.use(cors());

app.use(express.json());


// Variáveis globais 

let usuarios = []
let proximoUsuario = 1
let listaRecados = []
let idAutomatico = 1


// signup

app.post("/signup", async(request,response)=>{

    const data = request.body

    const nome = data.nome  
    const email = data.email
    const senhaDigitada = data.senhaDigitada

    const usuarioReptido = usuarios.find(usuario => usuario.email === email)

  
    if(!nome){
      return response.status(400).json({ Mensagem: "Por favor, verifique se passou o nome." })
      }
    
    if(!email){
      return response.status(400).json({ Mensagem: "Por favor, verifique se passou o email." })
    }

    if(usuarioReptido){
      return response.status(400).json({ Mensagem: "Email já cadastrado, insira outro." })
    }
  
    if(!senhaDigitada){
      return response.status(400).json({ Mensagem: "Por favor, verifique se passou a senha." })
    }
  

    const senhaCriptografada = await bcrypt.hash(senhaDigitada, 10)
  
    let novoUsuario ={
      id : proximoUsuario,
      nome : data.nome,
      email : data.email, 
      senhaDigitada :senhaCriptografada
    }
  
    usuarios.push(novoUsuario)
    proximoUsuario++
  
    return response.status(201).json({ Mensagem: `Seja bem vindo ${nome}. Pessoa usuária registrada com sucesso!` })
  
})


// login

app.post("/login", async(request,response)=>{
    
    const data = request.body
    const email = data.email
    const senha = data.senha

    const naoUsuario = usuarios.find(usuario => usuario.email === email)

  
    if(!email){
      return response.status(400).json({ Mensagem: "Insira um e-mail válido" })

    }

    if(!naoUsuario){
      return response.status(400).json({ Mensagem: "Email não encontrado no sistema, verifique ou crie uma conta" })

    }
  
    if(!senha){
      return response.status(400).json({ Mensagem: "Insira uma senha válida" })
    }
  
    const usuarioLogin = usuarios.find(usuario => usuario.email === email)
  
    console.log(usuarioLogin)
  
    const senhaMatch = await bcrypt.compare(senha, usuarioLogin.senhaDigitada)
  
  
    if(!senhaMatch){
      return response.status(400).json({ Mensagem: "Senha não encontrada em nosso banco. Credencial inválida" })
    }
  
    response.status(200).send(JSON.stringify({ Mensagem: `Seja bem vindo  ${usuarioLogin.nome}, Pessoa usuária logada com sucesso!` }))
  
  
})

// criar mensagem 

app.post("/mensagem", (request,response)=>{

    const data = request.body
    const emailMsg = data.email
    const title = data.title
    const description = data.description

    if(!emailMsg){
      return response.status(400).json({ Mensagem: "Insira um e-mail válido" })

    }

    const validarEmail = usuarios.find(msg => msg.email === emailMsg)

    if (!validarEmail) {
          return response.status(404).json({
              Mensagem: "Email não encontrado, verifique ou crie uma conta"
          })
      }

    let newMessage = {
      id:idAutomatico,
      title: title,
      description: description,
    }

    if(!title){
      return response.status(400).json({ Mensagem: "Escreva um título" })
    }

    if(!description){
      return response.status(400).json({ Mensagem: "Escreva uma mensagem" })
    }

    listaRecados.push(newMessage)
    idAutomatico++

    response.status(200).send(JSON.stringify({ Mensagem: `Mensagem criada com sucesso! ${title} ` }))
    

  })

  // ler mensagens

  app.get('/mensagem/:email', (request,response) => {
    const emailLeitura = request.params.email

    if(!emailLeitura){
      return response.status(404).json({ 
        Mensagem: "Insira um e-mail válido" 
      })
    }

    const procurarEmail = usuarios.find(msg => msg.email === emailLeitura)

    if (!procurarEmail) {
        return response.status(404).json({
            Mensagem: "Email não encontrado, verifique ou crie uma conta "
        })
    }

  response.status(200).send(JSON.stringify({Mensagem: "Seja bem-vindo!", listaRecados}))
  
})

// atualizar mensagem

app.put('/mensagem/:id', (request,response) => {
    
    const id = Number(request.params.id)
    
    const data = request.body

    if (!id) {
        return response.status(400).json({
            Mensagem: " Por favor, informe um id válido da mensagem"
        })
    }

    const validarId = listaRecados.findIndex(mensagem => mensagem.id === id)

    if (validarId === -1) {
        return response.status(404).json({
            Mensagem: "Mensagem não encontrada"
        })
    }

    const mensagemAtualizada = listaRecados[validarId]
    mensagemAtualizada.title = data.title
    mensagemAtualizada.description = data.description

    return response.status(200).json({
        Mensagem: "Mensagem atualizada com sucesso!",
        mensagemAtualizada
    })

})

// deletar mensagem

app.delete('/mensagem/:id', (request,response) => {
  
  const id = Number(request.params.id)

  if (!id) {
      return response.status(400).json({
          Mensagem: "Favor enviar um id válido"
      })
  }

  const procurarId = listaRecados.findIndex(msg => msg.id === id)

  if (procurarId === -1) {
      return response.status(404).json({
          Mensagem: "Mensagem não encontrada, verifique o identificador em nosso banco" });
  } else {
      listaRecados.splice(procurarId, 1);
      return response.status(200).json({ Mensagem: "Mensagem apagada com sucesso." });
  }
})

// leitura servidor
  

app.listen(8080,() => console.log("Servidor rodando na porta 8080"))