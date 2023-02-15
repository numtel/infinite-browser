const querystring = require('querystring');
const HTMLServer = require('./HTMLServer');
const Template = require('./Template');

module.exports = class WebGenServer extends HTMLServer {
  constructor(openai) {
    const tplIndex = new Template('src/views/index.html');

    super({
      '/': {
        async GET(req, urlMatch, parsedUrl) {
          return tplIndex.render({});
        },
        async POST(req, urlMatch, parsedUrl) {
          const body = await new Promise((resolve) => {
            let soFar = '';

            req.on('data', (chunk) => {
              soFar += chunk;
            });
            req.on('end', () => {
              resolve(soFar);
            });
          });

          const qs = (querystring.decode(body));
          return (await runCompletion(openai, 3000,
            `Write HTML and CSS for a web page with readable color text and multiple links ${qs.content}`))
            + `
             <form method="POST" id="next">
              <input type="hidden" name="content">
             </form>
             <script>
               document.querySelectorAll('a').forEach(link =>
                link.addEventListener('click', (event) => {
                  event.preventDefault();
                  const newPrompt = 'after clicking on link labelled "' + event.target.innerHTML + '" on page ${qs.content}';
                  const form = document.getElementById('next');
                  form.querySelector('input').value = newPrompt;
                  form.submit();
                })) 
             </script>
             `;
        },
      }
    });
  }
}

async function runCompletion(openai, max_tokens, prompt) {
  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    max_tokens,
//     best_of:10
  });
//   console.log(completion.data);
  return completion.data.choices[0].text;
}

