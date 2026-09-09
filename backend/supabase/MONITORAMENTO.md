# Monitoramento do Supabase

O frontend consulta no máximo um identificador da tabela `horarios` a cada
5 minutos enquanto a página está visível e o navegador está online.
Não altera dados nem imprime registros. Pode ser desativado com
`VITE_SUPABASE_CONNECTIVITY_MONITOR_ENABLED=false`.

Para executar uma verificação diária mesmo com o site fechado:

1. Envie `.github/workflows/supabase-connectivity.yml` à branch padrão do GitHub.
2. Em Settings > Secrets and variables > Actions, cadastre os repository secrets:
   - `SUPABASE_URL`: o valor de `VITE_SUPABASE_URL` do frontend.
   - `SUPABASE_PUBLIC_KEY`: o valor de `VITE_SUPABASE_ANON_KEY` (chave pública).
3. Em Actions > Verificar Supabase, use Run workflow para validar a configuração.

O agendamento é diário às 12:23 UTC (09:23 em Fortaleza). Ele só fica operacional
após publicação e configuração dos secrets. GitHub Actions pode atrasar ou
desativar agendamentos conforme suas regras e a atividade do repositório.

Consultas periódicas não garantem disponibilidade nem restauram projetos pausados.
O Supabase pode pausar projetos gratuitos com baixa atividade em 7 dias;
o plano Pro evita pausa por inatividade:
https://supabase.com/docs/guides/deployment/going-into-prod
