# 🚀 Hub Academy & Workspace Operacional

![Status](https://img.shields.io/badge/Status-Concluído-success)
![Tecnologias](https://img.shields.io/badge/Stack-JavaScript_|_Google_Apps_Script_|_HTML_|_CSS-blue)

Um portal corporativo completo (Single Page Application) desenvolvido para centralizar ferramentas operacionais, base de conhecimento e gamificar o processo de Onboarding (integração) de novos colaboradores do setor de Atendimento.

## 🎯 O Problema
Equipes de atendimento frequentemente sofrem com informações descentralizadas (links, manuais e processos espalhados), dificuldade em organizar escalas justas de tarefas e um processo de treinamento engessado que demanda muito tempo da liderança.

## 💡 A Solução
Desenvolvi uma plataforma unificada utilizando o **Google Workspace Ecosystem** (Apps Script + Sheets + Drive + Docs API) que atua como o "Sistema Operacional" da equipe. Ele une gestão do conhecimento, ferramentas de produtividade e uma "Academia" interativa para formação autônoma de novos analistas.

## 🌟 Destaques e Lógica Avançada

* 🎓 **Academy Gamificada & Certificação Automática:** Um módulo de treinamento completo. O sistema guia o analista por teoria, quizzes práticos e simulações de "Auditoria de Qualidade" (encontrar erros em e-mails). Ao atingir 100%, o backend aciona a API do Google Docs, injeta os dados do usuário em um template `.docx`, salva o certificado no Google Drive e emite o documento.
* 🧠 **Escala Inteligente baseada em Planta Baixa:** O módulo de Cronograma possui um algoritmo de sorteio que lê o "Mapa da Sala" físico. Ele impede automaticamente que dois analistas que sentam lado a lado sejam sorteados para a função de "Ligação Telefônica" no mesmo turno, evitando ruído cruzado no microfone.
* 📋 **Upload de Imagens via Área de Transferência (Ctrl+V):** Interceptação de eventos de paste no JavaScript. Ao colar um print no editor do sistema, o frontend converte a imagem para Base64 e o backend faz o upload direto para o Google Drive, retornando a URL pública instantaneamente.
* 🔐 **Controle de Acesso (RBAC):** Sistema de login próprio validado no backend, com renderização condicional de menus e privilégios totais de edição exclusivos para perfis "Admin".

## 🛠️ Módulos do Sistema
1. **Links Rápidos:** Gestão de plataformas e sistemas de uso diário.
2. **Cronograma & Mapa de Sala:** Distribuição de tarefas (E-mail vs Telefone) e visão interativa das mesas da equipe.
3. **Notepad Cloud:** Post-its digitais salvos automaticamente na nuvem por usuário.
4. **Respostas Prontas & Instruções:** Base de conhecimento com busca instantânea e cópia com 1 clique.
5. **Regras de Garantia (Marcas):** Tabela de consulta rápida para regras de RMA.
6. **Hub Academy (Treinamento):** Criação e execução de trilhas de aprendizado dinâmicas.

## 💻 Stack Tecnológica

* **Frontend:** HTML5, CSS3 (Custom Properties, Grid/Flexbox, Animações nativas) e JavaScript (Vanilla). SPA sem reload de página.
* **Backend:** Google Apps Script (V8 Engine).
* **Banco de Dados:** Google Sheets (Usado como banco NoSQL estruturado).
* **Storage e Automação:** Google Drive API e Google Docs API.

## 📸 Demonstração da Interface
> **Nota de Privacidade:** Dados sensíveis, IDs de pastas e informações reais da empresa foram removidos ou substituídos por dados fictícios neste repositório.

LOGIN

<img width="1895" height="802" alt="image" src="https://github.com/user-attachments/assets/e9fd1a67-8c9c-4f1d-8034-48a40db9c359" />

Tela inicial de links rapidos ( OBS: Apenas perfil de admin consegue adicionar novos links)

<img width="1919" height="791" alt="image" src="https://github.com/user-attachments/assets/6b06e6fb-0be3-4249-b306-08707eb793fb" />

Configuração do mapa de sala e cronograma de atividades

<img width="1711" height="856" alt="image" src="https://github.com/user-attachments/assets/dc51d46d-af7c-44a1-83b3-bfbb9cd857b8" />

Notepad pessoal dos analistas para anotações

<img width="1916" height="754" alt="image" src="https://github.com/user-attachments/assets/df45a469-9842-4a5e-a0b2-5cd8b80a414c" />

Respostas prontas de atendimento (Apenas users admins conseguem adicionar/editar)

<img width="1914" height="696" alt="image" src="https://github.com/user-attachments/assets/42b8dc35-a6f7-4573-b9b3-1c108b82d768" />

Regras de marca para orientação (apenas users admins conseguem adicionar/editar)

<img width="1912" height="611" alt="image" src="https://github.com/user-attachments/assets/1b8a24df-b19f-4f04-a5a1-1144840d24fb" />

Manuais para conhecimento geral de processos (apenaas users admins conseguem adicionar/editar)

<img width="1919" height="620" alt="image" src="https://github.com/user-attachments/assets/c4b3f1a5-3c4c-4b55-8db9-b2b84fb43b15" />

Trilha de treinamento para os analistas, (apenas os users admins conseguem adicionar/editar)

<img width="1914" height="712" alt="image" src="https://github.com/user-attachments/assets/4eedfa9b-4673-4662-b807-b5e819f0e914" />

Certificado de conclusão

<img width="1724" height="619" alt="image" src="https://github.com/user-attachments/assets/9a127557-f33a-4ca2-95f0-2611151fde32" />

Configuração da equipe/acessos e verificação dos certificados para download em PDF

<img width="1914" height="764" alt="image" src="https://github.com/user-attachments/assets/82ffb38d-92b7-4300-8b36-32585fe0f388" />

Gestão academy para configurar a trilha de treinamento

<img width="1917" height="611" alt="image" src="https://github.com/user-attachments/assets/b37af035-87e5-479c-baa6-8303e3940abf" />


---
👨‍💻 Desenvolvido por **Allan Christian** 
