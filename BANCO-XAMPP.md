# Banco local com XAMPP

1. A configuração do backend fica em `server/.env`. Copie `server/.env.example` para esse nome e ajuste usuário/senha se seu XAMPP usar outras credenciais. Neste computador, o `my.ini` confirma MySQL em `127.0.0.1:3306`, usuário `root`, senha vazia e banco `saudefacil`.
2. Abra o XAMPP Control Panel e inicie **MySQL**. A API cria o banco `saudefacil` e suas tabelas na primeira execução. Se preferir, importe [`server/schema.sql`](server/schema.sql) pelo phpMyAdmin antes de iniciar a API.
3. Em um terminal, rode `npm run server` para iniciar a API Node/Express na porta 3000.
4. Em outro terminal, rode `npm start` para abrir o Expo.

O `.env` da raiz contém apenas `EXPO_PUBLIC_API_URL=http://localhost:3000/api` para o app Expo. Para Android Emulator, troque `localhost` por `10.0.2.2`. Para um celular físico, use o IPv4 do computador na rede Wi-Fi (consulte `ipconfig`), por exemplo `http://192.168.0.15:3000/api`; mantenha os dois dispositivos na mesma rede e permita conexões do Node na porta 3000 no Firewall do Windows. Reinicie o Expo depois de alterar o `.env`.

As tabelas `users`, `imc_records` e `water_logs` guardam cadastro, cada cálculo de IMC e o total diário de água. Senhas são armazenadas com hash bcrypt. A chave `JWT_SECRET` fica somente em `server/.env`; não a prefixe com `EXPO_PUBLIC_`. O `.env.example` da raiz configura só o endereço que o app usa para chegar à API.

O projeto usa Expo SDK 54 e requer Node.js 20.19.4 ou superior. Confira `node --version` antes de iniciar o app.
