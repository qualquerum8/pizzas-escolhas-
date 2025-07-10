const apiKeyinput=document.getElementById('apiKey')
const pizzaselect=document.getElementById
('pizzaselect')
const selecionarinput=document.getElementById('selecionarinput')
const aksbutton=document.getElementById('aksbutton')

// Referencia a div principal onde a resposta da IA será exibida
const aiRespostaDiv = document.getElementById('aiResposta');
// Referencia a div interna com a classe 'response-content' onde o HTML formatado será inserido
const responseContentDiv = aiRespostaDiv.querySelector('.response-content');

const form=document.getElementById('form')

// Inicializa o conversor de Markdown para HTML
const converter = new showdown.Converter();

const perguntarAI = async (selecionar, pizza, apiKey) => {
    const model= "gemini-1.5-flash"
    const baseURL= `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    // Adicionado o pedido para a IA usar Markdown na resposta
    const pergunta = `olha, tenho essa pizza ${pizza} e queria saber, ${selecionar}. Por favor, formate sua resposta usando Markdown com títulos (h2 para o principal, h3/h4 para subtítulos), listas e negrito quando apropriado.`

    const contents =[{
        parts:[{
            text: pergunta
        }]
    }]

    try {
        const response = await fetch(baseURL, {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents
            })
        })

        // Verifica se a resposta da rede foi OK
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro da API:", errorData);
            throw new Error(`Erro na requisição da API: ${response.status} - ${errorData.error.message || 'Erro desconhecido'}`);
        }

        const data = await response.json()
        console.log({ data })

        if (data.candidates && data.candidates.length > 0) {
            const aiMarkdownText = data.candidates[0].content.parts[0].text;
            console.log("Resposta da IA (Markdown):", aiMarkdownText);

            // Converte o Markdown para HTML
            const aiHtml = converter.makeHtml(aiMarkdownText);
            
            // Insere o HTML formatado na div interna
            responseContentDiv.innerHTML = aiHtml;
        } else {
            responseContentDiv.innerHTML = "Não foi possível obter uma resposta da IA. Tente novamente.";
            console.error("No candidates found in the AI response:", data);
        }

        return data;
    } catch (error) {
        console.error("Erro ao chamar a API Gemini:", error);
        responseContentDiv.innerHTML = `Ocorreu um erro ao conectar com a IA: ${error.message}. Por favor, tente novamente mais tarde.`;
        throw error;
    }
}

const enviarFormulario =async (eventos) =>{
    eventos.preventDefault()
    const apiKey = apiKeyinput.value
    const pizzas = pizzaselect.value
    const seleciona = selecionarinput.value

    if(apiKey === '' || pizzas === '' || seleciona === '' )
        {
            alert('por favor, preencha todos os campos')
            return
    }
    aksbutton.disabled = true
    aksbutton.textContent='Perguntando...'
    aksbutton.classList.add('loading')

    // Limpa a resposta anterior
    responseContentDiv.innerHTML = ''; 

    try{
        await perguntarAI(seleciona, pizzas, apiKey)
    } catch(error) {
        console.log('error', error)
    }finally{
        aksbutton.disabled = false
        aksbutton.textContent="pergunta"
        aksbutton.classList.remove('loading')
    }
}
form.addEventListener('submit', enviarFormulario)
