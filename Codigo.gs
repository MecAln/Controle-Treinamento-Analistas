const SS = SpreadsheetApp.getActiveSpreadsheet();

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Academy Portal')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ==========================================
// 1. CONFIGURAÇÃO INICIAL (CRIAÇÃO DAS ABAS)
// ==========================================
function configurarSistema() {
  if (SS.getSheetByName("TREINAMENTO")) return; 

const abas = [
    { nome: "USUARIOS", colunas: ["NOME", "LOGIN", "SENHA", "SETOR", "CARGO", "STATUS"] },
    { nome: "LINKS", colunas: ["ID", "CATEGORIA", "NOME", "URL", "STATUS", "ORDEM"] },
    { nome: "MARCAS", colunas: ["ID", "MARCA", "REGRA", "TIPO"] },
    { nome: "CRONOGRAMA", colunas: ["DIA", "MANHÃ - LIGAÇÃO", "MANHÃ - E-MAIL", "TARDE - LIGAÇÃO", "TARDE - E-MAIL"] },
    { nome: "MAPA_SALA", colunas: ["ID_MESA", "SETOR", "ANALISTA"] },
    { nome: "ANOTACOES", colunas: ["ID", "LOGIN", "TITULO", "CONTEUDO", "COR", "DATA"] },
    { nome: "RESPOSTAS", colunas: ["ID", "CATEGORIA", "TITULO", "CONTEUDO"] },
    { nome: "INSTRUCOES", colunas: ["ID", "CATEGORIA", "TITULO", "CONTEUDO", "IMAGEM"] },
    { nome: "CERTIFICADOS", colunas: ["ID", "NOME", "LOGIN", "DATA", "URL_DOC"] },
    { nome: "TREINAMENTO", colunas: ["ID", "ORDEM", "TIPO", "TITULO", "JSON_DATA"] }
  ];

  abas.forEach(config => {
    let sheet = SS.getSheetByName(config.nome);
    if (!sheet) {
      sheet = SS.insertSheet(config.nome);
      sheet.appendRow(config.colunas);
      sheet.getRange(1, 1, 1, config.colunas.length).setBackground("#dc2626").setFontColor("white").setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  });

  let sheetUsers = SS.getSheetByName("USUARIOS");
  if (sheetUsers && sheetUsers.getLastRow() === 1) {
    sheetUsers.appendRow(["Allan (Líder)", "allan", "allan@pch", "Admin", "Líder", "Ativo"]);
    sheetUsers.appendRow(["Analista Teste", "analista", "123", "Atendimento", "Analista", "Ativo"]);
  }
  
  let sheetLinks = SS.getSheetByName("LINKS");
  if (sheetLinks && sheetLinks.getLastRow() === 1) {
    const links = [
      ["L-1", "Sistemas", "Magento ERP", "Ativo", 1],
      ["L-2", "Sistemas", "Freshdesk", "Ativo", 2],
      ["L-3", "Rastreios", "transp", "Ativo", 3]
    ];
    sheetLinks.getRange(2, 1, links.length, 6).setValues(links);
  }
}

function checkAdmin(login) {
  if(!login) return false;
  const sheet = SS.getSheetByName("USUARIOS");
  const data = sheet.getDataRange().getValues();
  for(let i=1; i<data.length; i++) {
    if(String(data[i][1]).toLowerCase() === String(login).toLowerCase() && String(data[i][3]) === "Admin") {
      return true;
    }
  }
  return false;
}

// ==========================================
// 2. AUTENTICAÇÃO E CARREGAMENTO EM MASSA
// ==========================================
function autenticarE_Carregar(login, pass) {
  configurarSistema(); 
  
  const users = SS.getSheetByName("USUARIOS").getDataRange().getValues().slice(1);
  let userLogged = null;
  
  for (let r of users) {
    if (String(r[1]).toLowerCase() === String(login).toLowerCase() && String(r[2]) === String(pass)) {
      let status = r[5] ? String(r[5]) : "Ativo";
      if (status === "Inativo") return { ok: false, erro: "Usuário inativo! Acesso negado." };
      let roleDisplay = r[4] ? String(r[4]) : String(r[3]);
      userLogged = { nome: r[0], login: r[1], setor: roleDisplay, isAdmin: String(r[3]) === "Admin" };
      break;
    }
  }
  
  if (!userLogged) return { ok: false, erro: "Credenciais inválidas!" };

  let listaUsuariosAdmin = [];
  if (userLogged.isAdmin) {
    listaUsuariosAdmin = users.map(u => ({
      nome: String(u[0]), login: String(u[1]), perfil: String(u[3]), cargo: u[4] ? String(u[4]) : '-', status: u[5] ? String(u[5]) : 'Ativo'
    }));
  }

  const dados = {
    usuario: userLogged,
    links: mapSheet("LINKS", ["id", "categoria", "nome", "url", "status", "ordem"]),
    marcas: mapSheet("MARCAS", ["id", "marca", "regra", "tipo"]),
    cronograma: mapSheet("CRONOGRAMA", ["dia", "m_lig", "m_email", "t_lig", "t_email"]),
    mapaSala: mapSheet("MAPA_SALA", ["id", "setor", "analista"]), 
    anotacoes: mapSheet("ANOTACOES", ["id", "login", "titulo", "conteudo", "cor", "data"]).filter(a => a.login === userLogged.login),
    respostas: mapSheet("RESPOSTAS", ["id", "categoria", "titulo", "conteudo"]),
    instrucoes: mapSheet("INSTRUCOES", ["id", "categoria", "titulo", "conteudo", "imagem"]),
    certificados: userLogged.isAdmin ? mapSheet("CERTIFICADOS", ["id", "nome", "login", "data", "url"]) : [],
    treinamento: mapSheet("TREINAMENTO", ["id", "ordem", "tipo", "titulo", "json_data"]),
    analistasParaSorteio: users.filter(u => String(u[3]) !== "Admin").map(u => u[0]),
    todosUsuarios: listaUsuariosAdmin
  };
  
  return { ok: true, dados: dados };
}

function mapSheet(sheetName, chaves) {
  const sheet = SS.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  
  const vals = sheet.getDataRange().getValues().slice(1); 
  
  return vals.map(row => {
    let obj = {};
    chaves.forEach((k, i) => obj[k] = row[i] !== "" && row[i] !== undefined ? String(row[i]) : ""); 
    return obj;
  });
}

// ==========================================
// 3. FUNÇÕES DE SALVAMENTO (BACKEND SEGURO)
// ==========================================
function salvarCronograma(adminLogin, matrizDias) {
  if(!checkAdmin(adminLogin)) throw new Error("Acesso negado.");
  const sheet = SS.getSheetByName("CRONOGRAMA");
  sheet.clearContents();
  sheet.appendRow(["DIA", "MANHÃ - LIGAÇÃO", "MANHÃ - E-MAIL", "TARDE - LIGAÇÃO", "TARDE - E-MAIL"]);
  sheet.getRange(1, 1, 1, 5).setBackground("#dc2626").setFontColor("white").setFontWeight("bold");
  if(matrizDias.length > 0) sheet.getRange(2, 1, matrizDias.length, 5).setValues(matrizDias);
  return true;
}

function salvarMesaMap(adminLogin, id, setor, analista) {
  if(!checkAdmin(adminLogin)) throw new Error("Acesso negado.");
  const sheet = SS.getSheetByName("MAPA_SALA");
  const data = sheet.getDataRange().getValues();
  for(let i = 1; i < data.length; i++){
    if(String(data[i][0]) === String(id)){
      sheet.getRange(i+1, 2).setValue(setor);
      sheet.getRange(i+1, 3).setValue(analista);
      return true;
    }
  }
  sheet.appendRow([id, setor, analista]);
  return true;
}

function salvarAnotacao(login, obj) {
  const sheet = SS.getSheetByName("ANOTACOES");
  const data = sheet.getDataRange().getValues();
  for(let i = 1; i < data.length; i++) {
    if(String(data[i][0]) === String(obj.id) && String(data[i][1]) === String(login)){
      sheet.getRange(i+1, 3).setValue(obj.titulo);
      sheet.getRange(i+1, 4).setValue(obj.conteudo);
      sheet.getRange(i+1, 5).setValue(obj.cor);
      return true;
    }
  }
  const dataStr = Utilities.formatDate(new Date(), "GMT-3", "dd/MM/yyyy HH:mm");
  sheet.appendRow([obj.id, login, obj.titulo, obj.conteudo, obj.cor, dataStr]);
  return true;
}

function excluirAnotacao(login, id) { 
  const sheet = SS.getSheetByName("ANOTACOES");
  const data = sheet.getDataRange().getValues();
  for(let i=1; i<data.length; i++){
    if(String(data[i][0]) === String(id) && String(data[i][1]) === String(login)){
      sheet.deleteRow(i+1); return true;
    }
  }
  return false;
}

function salvarResposta(adminLogin, obj) {
  if(!checkAdmin(adminLogin)) throw new Error("Acesso negado.");
  return salvarItemGenerico("RESPOSTAS", obj, ["categoria", "titulo", "conteudo"]);
}
function excluirResposta(adminLogin, id) {
  if(!checkAdmin(adminLogin)) throw new Error("Acesso negado.");
  return deletarLinhaPorID("RESPOSTAS", id);
}

function salvarInstrucao(adminLogin, obj) {
  if(!checkAdmin(adminLogin)) throw new Error("Acesso negado.");
  return salvarItemGenerico("INSTRUCOES", obj, ["categoria", "titulo", "conteudo", "imagem"]);
}
function excluirInstrucao(adminLogin, id) {
  if(!checkAdmin(adminLogin)) throw new Error("Acesso negado.");
  return deletarLinhaPorID("INSTRUCOES", id);
}

function salvarLinkDB(adminLogin, obj) {
  if(!checkAdmin(adminLogin)) throw new Error("Acesso negado.");
  return salvarItemGenerico("LINKS", obj, ["categoria", "nome", "url", "status", "ordem"]);
}
function excluirLinkDB(adminLogin, id) {
  if(!checkAdmin(adminLogin)) throw new Error("Acesso negado.");
  return deletarLinhaPorID("LINKS", id);
}

function salvarMarcaDB(adminLogin, obj) {
  if(!checkAdmin(adminLogin)) throw new Error("Acesso negado.");
  return salvarItemGenerico("MARCAS", obj, ["marca", "regra", "tipo"]);
}
function excluirMarcaDB(adminLogin, id) {
  if(!checkAdmin(adminLogin)) throw new Error("Acesso negado.");
  return deletarLinhaPorID("MARCAS", id);
}

function salvarItemGenerico(sheetName, obj, fields) {
  const sheet = SS.getSheetByName(sheetName);
  if (!obj.id) {
    obj.id = sheetName.charAt(0) + "-" + new Date().getTime();
    let row = [obj.id];
    fields.forEach(f => row.push(obj[f] || ""));
    sheet.appendRow(row);
  } else {
    const data = sheet.getDataRange().getValues();
    for(let i=1; i<data.length; i++){
      if(String(data[i][0]) === String(obj.id)){
        let row = [];
        fields.forEach(f => row.push(obj[f] || ""));
        sheet.getRange(i+1, 2, 1, fields.length).setValues([row]);
        break;
      }
    }
  }
  return obj;
}

function deletarLinhaPorID(nomeAba, id) {
  const sheet = SS.getSheetByName(nomeAba);
  const data = sheet.getDataRange().getValues();
  for(let i=1; i<data.length; i++){
    if(String(data[i][0]) === String(id)){
      sheet.deleteRow(i+1);
      return true;
    }
  }
  return false;
}

// ==========================================
// 4. ADMINISTRAÇÃO DE USUÁRIOS
// ==========================================
function salvarUsuarioDB(adminLogin, obj) {
  if(!checkAdmin(adminLogin)) return { ok: false, erro: "Acesso negado." };
  const sheet = SS.getSheetByName("USUARIOS");
  const data = sheet.getDataRange().getValues();
  
  if (obj.isEdit) {
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][1]).toLowerCase() === String(obj.login).toLowerCase()) {
        sheet.getRange(i+1, 1).setValue(obj.nome);
        if(obj.senha) sheet.getRange(i+1, 3).setValue(obj.senha);
        sheet.getRange(i+1, 4).setValue(obj.perfil);
        sheet.getRange(i+1, 5).setValue(obj.cargo);
        sheet.getRange(i+1, 6).setValue(obj.status);
        return { ok: true };
      }
    }
    return { ok: false, erro: "Usuário não encontrado." };
  } else {
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][1]).toLowerCase() === String(obj.login).toLowerCase()) {
        return { ok: false, erro: "O nome de usuário (login) já está em uso!" };
      }
    }
    sheet.appendRow([obj.nome, obj.login, obj.senha, obj.perfil, obj.cargo, obj.status]);
    return { ok: true };
  }
}

function excluirUsuarioDB(adminLogin, login) {
  if(!checkAdmin(adminLogin)) return { ok: false, erro: "Acesso negado." };
  const sheet = SS.getSheetByName("USUARIOS");
  const data = sheet.getDataRange().getValues();
  for(let i = 1; i < data.length; i++){
    if(String(data[i][1]).toLowerCase() === String(login).toLowerCase()){
      sheet.deleteRow(i + 1);
      return { ok: true };
    }
  }
  return { ok: false, erro: "Usuário não encontrado." };
}

function CriarNovoDocumento(dadosRecebidos) {
  try {
    const TEMPLATE_ID = "SEU_ID_DO_DOC_AQUI"; 
    
    // ==========================================
    // FORMATAÇÃO DE DATAS
    // ==========================================
    const dataObj = new Date();
    const dataCurta = Utilities.formatDate(dataObj, "GMT-3", "dd/MM/yyyy");
    
    const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const dia = dataObj.getDate();
    const mes = meses[dataObj.getMonth()];
    const ano = dataObj.getFullYear();
    const dataExtenso = dia + " de " + mes + " de " + ano;

    // ==========================================
    // CLONAGEM DO TEMPLATE
    // ==========================================
    const docName = 'Termo_Conclusao_Treinamento_' + dadosRecebidos.nome.replace(/\s+/g, '_');
    const templateFile = DriveApp.getFileById(TEMPLATE_ID);
    const novoArquivo = templateFile.makeCopy(docName);
    const novoDocId = novoArquivo.getId();

    const doc = DocumentApp.openById(novoDocId);
    const body = doc.getBody();

    body.replaceText("{{NOME_ANALISTA}}", dadosRecebidos.nome);
    body.replaceText("{{DATA_EXTENSO}}", dataExtenso);

    // ==========================================
    // DIVISÃO DOS TÓPICOS NAS DUAS COLUNAS
    // ==========================================
    let col1 = "";
    let col2 = "";
    
    if(dadosRecebidos.topicos && dadosRecebidos.topicos.length > 0) {
      const metade = Math.ceil(dadosRecebidos.topicos.length / 2);
      
      dadosRecebidos.topicos.forEach((topico, i) => {
        const numero = i + 1;
        if (i < metade) {
          col1 += numero + ". " + topico + "\n";
        } else {
          col2 += numero + ". " + topico + "\n";
        }
      });
    } else {
      col1 = "Nenhum tópico listado.";
    }

    body.replaceText("{{TOPICOS_1}}", col1.trim());
    body.replaceText("{{TOPICOS_2}}", col2.trim());

    // ==========================================
    // RODAPÉ E SALVAMENTO
    // ==========================================
    const docIdCurto = novoDocId.substring(0, 10).toUpperCase();
    
    let footer = doc.getFooter();
    if(!footer) footer = doc.addFooter();
    footer.clear(); 
    footer.appendParagraph("Documento Interno - Registro de Treinamento | Emitido em: " + dataCurta + " | DOC-ID: " + docIdCurto)
          .setAttributes({ [DocumentApp.Attribute.FONT_SIZE]: 8, [DocumentApp.Attribute.FOREGROUND_COLOR]: "#666666" })
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    doc.saveAndClose();

    // ==========================================
    // SALVA NO BANCO DE DADOS
    // ==========================================
    const sheetCert = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CERTIFICADOS");
    if(sheetCert) {
      sheetCert.appendRow([docIdCurto, dadosRecebidos.nome, dadosRecebidos.login, dataCurta, doc.getUrl()]);
    }

    return doc.getUrl();

  } catch (e) {
    throw new Error("Falha ao gerar o documento via Template: " + e.message);
  }
}

function salvarTreinamentoDB(adminLogin, obj) {
  if(!checkAdmin(adminLogin)) throw new Error("Acesso negado.");
  return salvarItemGenerico("TREINAMENTO", obj, ["ordem", "tipo", "titulo", "json_data"]);
}

function excluirTreinamentoDB(adminLogin, id) {
  if(!checkAdmin(adminLogin)) throw new Error("Acesso negado.");
  return deletarLinhaPorID("TREINAMENTO", id);
}

// ==========================================
// 5. UPLOAD DE IMAGEM VIA CTRL+V
// ==========================================
function uploadImagemDrive(adminLogin, base64Data, filename) {
  if(!checkAdmin(adminLogin)) throw new Error("Acesso negado para fazer upload.");
  
  try {
    const FOLDER_ID = "SEU_ID_DA_PASTA_AQUI";
    const folder = DriveApp.getFolderById(FOLDER_ID);

    const splitBase = base64Data.split(',');
    const contentType = splitBase[0].split(':')[1].split(';')[0];
    const bytes = Utilities.base64Decode(splitBase[1]);
    
    const blob = Utilities.newBlob(bytes, contentType, filename);
    const file = folder.createFile(blob);
    
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return "https://drive.google.com/uc?export=view&id=" + file.getId();
    
  } catch (e) {
    throw new Error("Falha ao salvar imagem no Drive: " + e.message);
  }
}
