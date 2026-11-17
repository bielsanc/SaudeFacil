# Guia do backend e APIs do SaudeFacil

Este projeto usa Expo SDK 54 no aplicativo e Node.js/Express na API. O backend atende autenticação, banco de dados, busca de UBS e proxy da API de frutas.

## Requisitos

- Node.js 20.19.4 ou superior (`node --version`). A versão instalada durante a preparação deste guia foi 20.11.1, abaixo do requisito.
- MySQL/MariaDB do XAMPP iniciado, caso queira usar cadastro, login, IMC e hidratação.
- App e computador servidor na mesma rede Wi-Fi ao testar em celular físico.

## 1. Instalar dependências

Na pasta raiz do projeto:

```bash
npm install
```

No Android/iOS, o mapa usa `react-native-maps` instalado na versão compatível com o SDK 54. Na web, usa Leaflet com tiles OpenStreetMap para evitar importar o módulo nativo no navegador. O Expo Go dá suporte ao mapa nativo durante o desenvolvimento. Para publicar um binário Android com Google Maps, configure projeto Google Cloud e chave Maps SDK conforme a [documentação Expo para SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/map-view/).

## 2. Configurar e iniciar o backend

1. Copie `server/.env.example` para `server/.env`.
2. Confira `DB_HOST`, `DB_PORT`, `DB_USER` e `DB_PASSWORD` com os dados do MySQL no XAMPP. A configuração padrão é `127.0.0.1:3306`, `root`, senha vazia.
3. Troque `JWT_SECRET` por uma chave aleatória privada de pelo menos 32 caracteres. Não coloque essa chave no `.env` da raiz nem em variável `EXPO_PUBLIC_`.
4. No XAMPP, inicie MySQL. O backend cria o banco `saudefacil` e as tabelas necessárias ao iniciar; alternativamente, importe `server/schema.sql` no phpMyAdmin.
5. Inicie a API:

```bash
npm run server
```

O serviço escuta em `0.0.0.0:3000`. Confirme abrindo `http://localhost:3000/api/health`, que deve responder `{"ok":true}`. Se o Windows Firewall perguntar, permita conexões privadas na porta 3000 para usar o app no celular.

## 3. Apontar o Expo para a API

Copie `.env.example` para `.env` na raiz e ajuste `EXPO_PUBLIC_API_URL`:

| Onde roda o app | URL |
| --- | --- |
| Web no mesmo computador | `http://localhost:3000/api` |
| Android Emulator | O app tenta usar o host do Expo; se preciso, configure `http://10.0.2.2:3000/api` |
| Celular físico | No Expo Go o app tenta usar o host do Metro; se preciso, configure `http://IP-DO-PC:3000/api` |

No celular, o app usa `expo-constants` para detectar o host de desenvolvimento do Expo quando a URL está configurada como `localhost`. Se não conseguir conectar, descubra o IPv4 do computador com `ipconfig`, use o endereço da rede Wi-Fi (por exemplo `192.168.0.15`) e mantenha ambos na mesma rede. Depois de alterar `.env`, reinicie o Expo para carregar a variável:

```bash
npm start
```

## 4. Geolocalização e UBS próximas

Ao abrir a tela, o app pede permissão de localização em primeiro plano, usa a última posição recente quando disponível e busca a posição atual como alternativa. O backend consulta o Overpass API do OpenStreetMap em até 5 km, ordena as unidades por distância e devolve nome, endereço e coordenadas. O mapa nativo mostra sua posição, os marcadores e uma lista com atalho para rota.

Rotas disponíveis:

- `GET /api/ubs?latitude=-23.55&longitude=-46.63` — lista unidades em um raio padrão de 5 km.
- `GET /api/ubs?latitude=...&longitude=...&radius=8000` — o raio pode variar de 500 m a 10 km.

Os dados dependem de mapeamento colaborativo do OpenStreetMap e podem não listar todas as UBS ou ter endereços incompletos. A busca requer internet. Para build publicado Android usando Google Maps, será necessária uma chave do Google Maps conforme a documentação da biblioteca.

## 5. API de frutas e tradução opcional

O app chama o backend, que consulta o Fruityvice. Isso evita depender de configurações especiais de CORS no app web e deixa o acesso externo concentrado no servidor.

- `GET /api/fruit/:name` — consulta fruta pelo nome em inglês aceito pela Fruityvice (ex.: `/api/fruit/Banana`). O app traduz nomes conhecidos em português para os nomes da API.
- `POST /api/translate/batch` com `{ "texts": ["Apple", "Banana"] }` — traduz o catálogo para português via DeepL quando há chave configurada.

Para ativar tradução dinâmica, obtenha uma chave DeepL API e configure `DEEPL_API_KEY` somente em `server/.env`, depois reinicie o backend. Sem a chave, a tradução dinâmica retorna indisponível e o app usa seu catálogo fixo em português. A imagem da fruta continua sendo consultada no Wikimedia Commons diretamente pelo app.

## 6. Endpoints do projeto

| Endpoint | Uso | Autenticação |
| --- | --- | --- |
| `GET /api/health` | Verificar se a API está ativa | Não |
| `POST /api/auth/register` | Criar conta | Não |
| `POST /api/auth/login` | Entrar | Não |
| `GET/PATCH /api/auth/me` | Consultar/alterar perfil | Bearer token |
| `POST /api/imc` | Registrar IMC | Bearer token |
| `GET/PUT /api/water/today` | Ler/atualizar consumo de água do dia | Bearer token |
| `GET/POST /api/pressure` | Consultar e registrar medições de pressão arterial | Bearer token |
| `GET/POST /api/glucose` | Consultar e registrar medições de glicemia | Bearer token |
| `GET /api/ubs` | Buscar UBS pela localização | Não |
| `GET /api/fruit/:name` | Consultar dados nutricionais de fruta | Não |
| `POST /api/translate/batch` | Traduzir lista de nomes | Não |

## Diagnóstico rápido

- `ECONNREFUSED` no login: inicie `npm run server`, confirme a URL Expo e veja se o MySQL do XAMPP está ativo.
- Funciona no computador, mas não no celular: troque `localhost` pelo IPv4 do PC e verifique firewall/rede.
- UBS não aparecem: confirme permissão/GPS e internet; Overpass pode estar temporariamente indisponível ou a área pode não ter unidades cadastradas.
- Dados de fruta aparecem, mas nomes não mudam: configure `DEEPL_API_KEY`; sem ela o fallback em português permanece ativo.
